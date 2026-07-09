/**
 * package.json contract tests — the invariants n8n's community-node and
 * verified-node rules depend on. Pure file reads, no build required.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

describe('package.json contract', () => {
	it('is named with the required n8n-nodes- prefix', () => {
		assert.ok(
			pkg.name.startsWith('n8n-nodes-'),
			`package name must start with "n8n-nodes-", got "${pkg.name}"`,
		);
	});

	it('carries the n8n-community-node-package keyword', () => {
		assert.ok(Array.isArray(pkg.keywords));
		assert.ok(pkg.keywords.includes('n8n-community-node-package'));
	});

	it('registers the expected credential and node entry points', () => {
		assert.deepEqual(pkg.n8n.credentials, ['dist/credentials/SkuIoOAuth2Api.credentials.js']);
		assert.ok(pkg.n8n.nodes.includes('dist/nodes/SkuIo/SkuIo.node.js'));
		assert.ok(pkg.n8n.nodes.includes('dist/nodes/SkuIo/SkuIoTrigger.node.js'));
	});

	it('references only dist/ paths whose TypeScript sources exist (so build produces them)', () => {
		const entries = [...pkg.n8n.credentials, ...pkg.n8n.nodes];
		assert.ok(entries.length > 0);

		for (const entry of entries) {
			assert.ok(entry.startsWith('dist/'), `${entry} must live under dist/`);
			assert.ok(entry.endsWith('.js'), `${entry} must be a compiled .js file`);

			const source = entry.replace(/^dist\//, '').replace(/\.js$/, '.ts');
			assert.ok(
				existsSync(join(root, source)),
				`source file ${source} is missing — ${entry} would not exist after build`,
			);
		}
	});

	it('requires Node 22 or newer', () => {
		const match = /^>=\s*(\d+)/.exec(pkg.engines?.node ?? '');
		assert.ok(match, `engines.node must be a ">=" constraint, got "${pkg.engines?.node}"`);
		assert.ok(
			Number(match[1]) >= 22,
			`engines.node must require at least Node 22, got "${pkg.engines.node}"`,
		);
	});

	it('is MIT licensed', () => {
		assert.equal(pkg.license, 'MIT');
	});

	it('has zero runtime dependencies (verified-node rule)', () => {
		assert.ok(
			pkg.dependencies === undefined || Object.keys(pkg.dependencies).length === 0,
			`runtime dependencies are not allowed for verified nodes, found: ${Object.keys(
				pkg.dependencies ?? {},
			).join(', ')}`,
		);
	});
});
