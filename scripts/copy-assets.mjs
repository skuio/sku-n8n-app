#!/usr/bin/env node
/**
 * Copies static node assets (icons + codex metadata) into dist/ after tsc.
 *
 * tsc only emits .js/.d.ts/.map files, but n8n resolves each node's `icon`
 * (nodes/SkuIo/*.svg) and codex file (nodes/SkuIo/*.node.json) relative to the
 * compiled node file, so they must live at the mirrored path under dist/.
 *
 * Invoked by `npm run build` (see package.json: "tsc && node scripts/copy-assets.mjs").
 */
import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = join(root, 'nodes', 'SkuIo');
const targetDir = join(root, 'dist', 'nodes', 'SkuIo');

mkdirSync(targetDir, { recursive: true });

const assets = readdirSync(sourceDir, { withFileTypes: true })
	.filter((entry) => entry.isFile())
	.map((entry) => entry.name)
	.filter((name) => name.endsWith('.svg') || name.endsWith('.node.json'));

for (const name of assets) {
	copyFileSync(join(sourceDir, name), join(targetDir, name));
}

console.log(`copy-assets: copied ${assets.length} asset(s) to dist/nodes/SkuIo/`);
