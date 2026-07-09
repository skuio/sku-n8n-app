/**
 * Offline unit tests for nodes/SkuIo/GenericFunctions.ts.
 *
 * Runs against the COMPILED output — execute `npm run build` first, then
 * `node --test test/`. No test framework beyond node:test / node:assert.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
	compact,
	extractHomePodHost,
	formatSkuIoError,
	skuIoApiRequest,
	unwrapList,
} from '../dist/nodes/SkuIo/GenericFunctions.js';

describe('compact()', () => {
	it('trims string values', () => {
		assert.deepEqual(compact({ name: '  Widget  ' }), { name: 'Widget' });
	});

	it('drops empty-string, null and undefined keys', () => {
		assert.deepEqual(
			compact({ a: '', b: '   ', c: null, d: undefined, e: 'keep' }),
			{ e: 'keep' },
		);
	});

	it('drops empty nested objects and arrays', () => {
		assert.deepEqual(
			compact({
				emptyObject: {},
				emptyArray: [],
				nestedAllBlank: { a: '', b: null },
				arrayAllBlank: ['', null, {}],
			}),
			{},
		);
	});

	it('recurses into arrays of objects', () => {
		assert.deepEqual(
			compact({ lines: [{ sku: '  ABC-1  ', note: '' }, {}, null, { qty: 2 }] }),
			{ lines: [{ sku: 'ABC-1' }, { qty: 2 }] },
		);
	});

	it('preserves numbers and booleans, including 0 and false', () => {
		assert.deepEqual(
			compact({ quantity: 0, archived: false, price: 12.5, active: true }),
			{ quantity: 0, archived: false, price: 12.5, active: true },
		);
	});
});

describe('formatSkuIoError()', () => {
	it('flattens a Laravel {message, errors} body into one readable, deduped string', () => {
		const error = {
			response: {
				body: {
					message: 'The given data was invalid.',
					errors: {
						sku: ['The sku field is required.', 'The given data was invalid.'],
						name: ['The name field is required.'],
					},
				},
			},
		};

		const result = formatSkuIoError(error);

		assert.ok(result.includes('The given data was invalid.'));
		assert.ok(result.includes('The sku field is required.'));
		assert.ok(result.includes('The name field is required.'));
		assert.equal(
			result.indexOf('The given data was invalid.'),
			result.lastIndexOf('The given data was invalid.'),
			'duplicate messages must be deduped',
		);
	});

	it('parses a string JSON response body', () => {
		const error = {
			response: {
				body: JSON.stringify({
					message: 'Unauthenticated.',
					errors: { token: ['The token has expired.'] },
				}),
			},
		};

		const result = formatSkuIoError(error);

		assert.ok(result.includes('Unauthenticated.'));
		assert.ok(result.includes('The token has expired.'));
	});

	it('falls back to error.message when no structured body exists', () => {
		assert.equal(formatSkuIoError({ message: 'socket hang up' }), 'socket hang up');
	});

	it('returns a generic message for completely unknown errors', () => {
		assert.equal(formatSkuIoError({}), 'SKU.io request failed with an unknown error');
	});
});

describe('extractHomePodHost()', () => {
	it('finds home_pod_host in error.response.body and prefixes https:// when missing', () => {
		assert.equal(
			extractHomePodHost({ response: { body: { home_pod_host: 'au.app.sku.io' } } }),
			'https://au.app.sku.io',
		);
	});

	it('finds home_pod_host in error.cause.response.body', () => {
		assert.equal(
			extractHomePodHost({
				cause: { response: { body: { home_pod_host: 'eu.app.sku.io' } } },
			}),
			'https://eu.app.sku.io',
		);
	});

	it('finds home_pod_host at the error root and keeps an existing scheme', () => {
		assert.equal(
			extractHomePodHost({ home_pod_host: 'https://us.app.sku.io' }),
			'https://us.app.sku.io',
		);
	});

	it('returns undefined when absent', () => {
		assert.equal(extractHomePodHost({}), undefined);
		assert.equal(
			extractHomePodHost({ response: { body: { message: 'nope' } } }),
			undefined,
		);
	});
});

describe('unwrapList()', () => {
	it('passes a bare array through', () => {
		assert.deepEqual(unwrapList([{ id: 1 }, { id: 2 }]), [{ id: 1 }, { id: 2 }]);
	});

	it('unwraps a {data: [...]} envelope', () => {
		assert.deepEqual(unwrapList({ data: [{ id: 3 }] }), [{ id: 3 }]);
	});

	it('unwraps a Laravel paginator {data: {data: [...]}}', () => {
		assert.deepEqual(
			unwrapList({ data: { data: [{ id: 4 }], current_page: 1, total: 1 } }),
			[{ id: 4 }],
		);
	});

	it('returns [] for junk', () => {
		assert.deepEqual(unwrapList({}), []);
		assert.deepEqual(unwrapList({ data: 'junk' }), []);
		assert.deepEqual(unwrapList({ message: 'ok' }), []);
	});
});

describe('skuIoApiRequest() — 421 pod-follow invariants', () => {
	const CREDENTIAL_NAME = 'skuIoOAuth2Api';

	/**
	 * Fake execution context: records every httpRequestWithAuthentication call
	 * (credential name + full request options) and delegates to the stub.
	 */
	const makeFakeContext = (stub) => {
		const calls = [];
		const fakeThis = {
			getCredentials: async () => ({ baseUrl: 'https://app.sku.io' }),
			getNode: () => ({ name: 'test', type: 'n8n-nodes-sku-io.skuIo', typeVersion: 1 }),
			helpers: {
				httpRequestWithAuthentication: async (credentialName, options) => {
					calls.push({ credentialName, options });
					return stub(calls.length);
				},
			},
		};
		return { fakeThis, calls };
	};

	const podError = () => ({
		httpCode: 421,
		response: { body: { home_pod_host: 'au.app.sku.io' } },
		message: 'Misdirected Request',
	});

	it('follows a 421 exactly once, replaying the identical request against home_pod_host with the same credential', async () => {
		const { fakeThis, calls } = makeFakeContext((callNumber) => {
			if (callNumber === 1) {
				throw podError();
			}
			return { ok: true };
		});

		const body = { name: 'Widget', quantity: 3 };
		const qs = { include: 'lines', per_page: 10 };
		const result = await skuIoApiRequest.call(fakeThis, 'POST', '/products', body, qs);

		assert.deepEqual(result, { ok: true });
		assert.equal(calls.length, 2, 'exactly two HTTP calls: original + one pod follow');

		assert.ok(
			calls[0].options.url.startsWith('https://app.sku.io/api'),
			`first hop hits the credential baseUrl, got ${calls[0].options.url}`,
		);
		assert.ok(
			calls[1].options.url.startsWith('https://au.app.sku.io/api'),
			`second hop hits the home pod, got ${calls[1].options.url}`,
		);

		assert.equal(calls[0].credentialName, CREDENTIAL_NAME);
		assert.equal(
			calls[1].credentialName,
			CREDENTIAL_NAME,
			'pod follow must reuse the SAME credential (same-token invariant)',
		);

		assert.equal(calls[0].options.method, calls[1].options.method);
		assert.deepEqual(calls[0].options.body, calls[1].options.body);
		assert.deepEqual(calls[0].options.qs, calls[1].options.qs);
	});

	it('does not loop when the home pod also returns 421 — exactly two calls, then throws', async () => {
		const { fakeThis, calls } = makeFakeContext(() => {
			throw podError();
		});

		await assert.rejects(skuIoApiRequest.call(fakeThis, 'GET', '/products'));
		assert.equal(calls.length, 2, 'one-hop guard: original + one follow, never a third');
	});

	it('throws without following when a 421 carries no home_pod_host', async () => {
		const { fakeThis, calls } = makeFakeContext(() => {
			throw { httpCode: 421, response: { body: {} }, message: 'Misdirected Request' };
		});

		await assert.rejects(skuIoApiRequest.call(fakeThis, 'GET', '/products'));
		assert.equal(calls.length, 1);
	});
});
