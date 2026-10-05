/**
 * Offline tests for SkuIo.execute() error handling (verified-node rule:
 * errors leave the node as NodeApiError / NodeOperationError).
 *
 * Runs against the COMPILED output — execute `npm run build` first.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createRequire } from 'node:module';

import { SkuIo } from '../dist/nodes/SkuIo/SkuIo.node.js';

// The compiled node loads n8n-workflow's CommonJS build; use the same one so
// `instanceof` compares against the class the node actually throws.
const { NodeApiError } = createRequire(import.meta.url)('n8n-workflow');

const node = { id: 'n1', name: 'SKU.io', type: 'n8n-nodes-sku-io.skuIo', typeVersion: 1, position: [0, 0], parameters: {} };

function context({ continueOnFail = false, reject }) {
	const params = { resource: 'customer', operation: 'create', name: 'Ada', additionalFields: {} };
	return {
		getInputData: () => [{ json: {} }],
		getNodeParameter: (name, _i, fallback) => params[name] ?? fallback,
		getNode: () => node,
		getCredentials: async () => ({ baseUrl: 'https://app.sku.io' }),
		continueOnFail: () => continueOnFail,
		helpers: {
			httpRequestWithAuthentication: async () => {
				throw reject;
			},
			returnJsonArray: (data) => (Array.isArray(data) ? data : [data]).map((json) => ({ json })),
			constructExecutionMetaData: (items) => items,
		},
	};
}

describe('SkuIo.execute() errors', () => {
	const validationError = Object.assign(new Error('Request failed with status code 422'), {
		httpCode: '422',
		response: { body: { message: 'The product 66 is not associated to the supplier.' } },
	});

	it('surfaces a SKU.io API failure as a NodeApiError carrying the SKU.io message, status and item index', async () => {
		await assert.rejects(
			() => new SkuIo().execute.call(context({ reject: validationError })),
			(error) => {
				assert.ok(error instanceof NodeApiError, `expected NodeApiError, got ${error?.constructor?.name}`);
				assert.match(error.message, /not associated to the supplier/);
				assert.equal(String(error.httpCode), '422');
				assert.equal(error.context?.itemIndex, 0);
				return true;
			},
		);
	});

	it('returns the error as item data when Continue On Fail is enabled', async () => {
		const [items] = await new SkuIo().execute.call(context({ continueOnFail: true, reject: validationError }));
		assert.equal(items.length, 1);
		assert.match(items[0].json.error, /not associated to the supplier/);
	});
});
