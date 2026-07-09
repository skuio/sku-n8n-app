import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

type SkuIoContext =
	| IExecuteFunctions
	| IHookFunctions
	| ILoadOptionsFunctions
	| IWebhookFunctions;

const CREDENTIAL_NAME = 'skuIoOAuth2Api';

/**
 * Single request helper for every SKU.io API call.
 *
 * Invariants (do not relitigate — see the automation-platform standard):
 * - Stateless pod routing: a 421 response means the tenant lives on another
 *   pod; retry the IDENTICAL request against `home_pod_host` ONCE, with the
 *   SAME token (httpRequestWithAuthentication attaches it), never pinning the
 *   host anywhere. `isPodFollow` is the one-hop no-loop guard.
 * - The single error shaper: Laravel `{message, errors}` becomes one readable
 *   message; nothing else in the app formats API errors.
 */
export async function skuIoApiRequest(
	this: SkuIoContext,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	isPodFollow = false,
	hostOverride?: string,
): Promise<IDataObject> {
	const credentials = await this.getCredentials(CREDENTIAL_NAME);
	const baseUrl = ((hostOverride ?? credentials.baseUrl) as string).replace(/\/+$/, '');

	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl}/api${endpoint}`,
		headers: {
			Accept: 'application/json',
			'User-Agent': 'SKU.io-n8n/0.1.0',
		},
		qs,
		json: true,
	};

	if (Object.keys(body).length > 0) {
		options.body = body;
	}

	try {
		return (await this.helpers.httpRequestWithAuthentication.call(
			this,
			CREDENTIAL_NAME,
			options,
		)) as IDataObject;
	} catch (error) {
		const statusCode = Number(
			(error as JsonObject).httpCode ?? (error as JsonObject).statusCode ?? 0,
		);

		if (statusCode === 421 && !isPodFollow) {
			const homePodHost = extractHomePodHost(error as JsonObject);
			if (homePodHost) {
				return await skuIoApiRequest.call(this, method, endpoint, body, qs, true, homePodHost);
			}
		}

		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: formatSkuIoError(error as JsonObject),
		});
	}
}

/**
 * Pull `home_pod_host` out of a 421 error response body, tolerating the
 * different places the HTTP client may park it.
 */
export function extractHomePodHost(error: JsonObject): string | undefined {
	const candidates: unknown[] = [
		(error as IDataObject).response,
		((error as IDataObject).response as IDataObject | undefined)?.body,
		(error as IDataObject).cause,
		((error as IDataObject).cause as IDataObject | undefined)?.response,
		(((error as IDataObject).cause as IDataObject | undefined)?.response as
			| IDataObject
			| undefined)?.body,
		error,
	];

	for (const candidate of candidates) {
		if (candidate === null || typeof candidate !== 'object') continue;
		const host = (candidate as IDataObject).home_pod_host;
		if (typeof host === 'string' && host !== '') {
			return host.startsWith('http') ? host : `https://${host}`;
		}
	}

	return undefined;
}

/**
 * The single error shaper: Laravel `{message, errors: {field: [msgs]}}`
 * becomes one readable line so workflow authors see field-level validation
 * messages instead of "422 Unprocessable Entity".
 */
export function formatSkuIoError(error: JsonObject): string {
	const bodies: unknown[] = [
		((error as IDataObject).response as IDataObject | undefined)?.body,
		(((error as IDataObject).cause as IDataObject | undefined)?.response as
			| IDataObject
			| undefined)?.body,
		(error as IDataObject).errorResponse,
		error,
	];

	for (const raw of bodies) {
		let parsed = raw;
		if (typeof parsed === 'string') {
			try {
				parsed = JSON.parse(parsed);
			} catch {
				continue;
			}
		}
		if (parsed === null || typeof parsed !== 'object') continue;

		const body = parsed as IDataObject;
		const parts: string[] = [];

		if (typeof body.message === 'string' && body.message !== '') {
			parts.push(body.message);
		}

		if (body.errors !== null && typeof body.errors === 'object') {
			for (const messages of Object.values(body.errors as IDataObject)) {
				if (Array.isArray(messages)) {
					parts.push(...messages.filter((m): m is string => typeof m === 'string'));
				} else if (typeof messages === 'string') {
					parts.push(messages);
				}
			}
		}

		if (parts.length > 0) {
			return [...new Set(parts)].join(' ');
		}
	}

	const message = (error as IDataObject).message;
	return typeof message === 'string' && message !== ''
		? message
		: 'SKU.io request failed with an unknown error';
}

/**
 * Input hygiene is the app's job (pattern #8): trim strings and drop empty
 * keys/objects/arrays so blanks from unmapped n8n expressions never reach
 * Laravel validators as "".
 */
export function compact(value: IDataObject): IDataObject {
	const result: IDataObject = {};

	for (const [key, raw] of Object.entries(value)) {
		if (raw === undefined || raw === null) continue;

		if (typeof raw === 'string') {
			const trimmed = raw.trim();
			if (trimmed === '') continue;
			result[key] = trimmed;
			continue;
		}

		if (Array.isArray(raw)) {
			const items = raw
				.map((item) =>
					item !== null && typeof item === 'object' && !Array.isArray(item)
						? compact(item as IDataObject)
						: item,
				)
				.filter((item) => {
					if (item === undefined || item === null) return false;
					if (typeof item === 'string') return item.trim() !== '';
					if (typeof item === 'object' && !Array.isArray(item)) {
						return Object.keys(item as IDataObject).length > 0;
					}
					return true;
				});
			if (items.length === 0) continue;
			result[key] = items;
			continue;
		}

		if (typeof raw === 'object') {
			const nested = compact(raw as IDataObject);
			if (Object.keys(nested).length === 0) continue;
			result[key] = nested;
			continue;
		}

		result[key] = raw;
	}

	return result;
}

/**
 * Tolerant list unwrapping (pattern #9): endpoints are heterogeneous — bare
 * array, Laravel paginator, or `{data: [...]}` wrapper all appear.
 */
export function unwrapList(response: IDataObject | IDataObject[]): IDataObject[] {
	if (Array.isArray(response)) {
		return response;
	}
	if (Array.isArray(response.data)) {
		return response.data as IDataObject[];
	}
	if (
		response.data !== null &&
		typeof response.data === 'object' &&
		Array.isArray((response.data as IDataObject).data)
	) {
		return (response.data as IDataObject).data as IDataObject[];
	}
	return [];
}

/**
 * Dropdown option loader backing every ID input (pattern #7).
 */
export async function loadIdNameOptions(
	this: ILoadOptionsFunctions,
	endpoint: string,
	nameKeys: string[] = ['name'],
): Promise<Array<{ name: string; value: number | string }>> {
	const response = await skuIoApiRequest.call(this, 'GET', endpoint, {}, { per_page: 200 });

	return unwrapList(response)
		.filter((item) => item.id !== undefined && item.id !== null)
		.map((item) => {
			const nameKey = nameKeys.find(
				(key) => typeof item[key] === 'string' && (item[key] as string) !== '',
			);
			return {
				name: nameKey ? (item[nameKey] as string) : `#${item.id}`,
				value: item.id as number | string,
			};
		});
}
