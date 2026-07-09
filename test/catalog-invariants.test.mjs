/**
 * Trigger catalog + credential scope invariants.
 *
 * Reads the TypeScript SOURCES as text (no build needed): the 10 webhook
 * event values must each appear exactly once in the trigger node, and the
 * OAuth scope string must cover the scopes the nodes depend on.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const readSource = (relativePath) => {
	const absolutePath = join(root, relativePath);
	assert.ok(existsSync(absolutePath), `${relativePath} is missing`);
	return readFileSync(absolutePath, 'utf8');
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Counts catalog declarations of an event, i.e. `value: '<event>'` option
 * entries — the parameter `default` may legitimately repeat one event value,
 * so a bare substring count would over-count.
 */
const countOptionValueDeclarations = (source, event) =>
	(source.match(new RegExp(`value:\\s*['"]${escapeRegExp(event)}['"]`, 'g')) ?? []).length;

const TRIGGER_EVENTS = [
	'sales_order.created',
	'sales_order.shipped',
	'sales_order.cancelled',
	'purchase_order.created',
	'purchase_order.approved',
	'purchase_order.submitted',
	'purchase_order.received',
	'inventory.adjusted',
	'product.created',
	'customer.created',
];

describe('SkuIoTrigger event catalog', () => {
	const triggerSource = readSource('nodes/SkuIo/SkuIoTrigger.node.ts');

	for (const event of TRIGGER_EVENTS) {
		it(`declares ${event} exactly once`, () => {
			assert.equal(
				countOptionValueDeclarations(triggerSource, event),
				1,
				`event value "${event}" must appear exactly once as an option value in SkuIoTrigger.node.ts`,
			);
		});
	}

	it(`catalogs all ${TRIGGER_EVENTS.length} events`, () => {
		const missing = TRIGGER_EVENTS.filter(
			(event) => !triggerSource.includes(event),
		);
		assert.deepEqual(missing, [], `missing events: ${missing.join(', ')}`);
	});

	it('defaults to a cataloged event', () => {
		const match = /default:\s*['"]([a-z_]+\.[a-z_]+)['"]/.exec(triggerSource);
		assert.ok(match, 'the event parameter must declare a default');
		assert.ok(
			TRIGGER_EVENTS.includes(match[1]),
			`default "${match[1]}" must be one of the cataloged events`,
		);
	});
});

describe('SkuIoOAuth2Api credential scopes', () => {
	const credentialSource = readSource('credentials/SkuIoOAuth2Api.credentials.ts');

	for (const scope of ['webhooks:manage', 'warehouses:read', 'settings:read']) {
		it(`requests the ${scope} scope`, () => {
			assert.ok(
				credentialSource.includes(scope),
				`scope "${scope}" must be part of the credential's scope string`,
			);
		});
	}
});
