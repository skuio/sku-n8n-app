/**
 * ESLint config for the n8n community-node linter, following the official
 * n8n-nodes-starter layout (eslint 8 legacy config + eslint-plugin-n8n-nodes-base).
 *
 * `npm run lint` runs `eslint nodes credentials --ext .ts`, so the credentials/
 * and nodes/ overrides are the ones exercised in CI. The package.json override
 * (verified-node community rules) is available for editor linting and explicit
 * `npx eslint package.json` runs — it parses without type information because
 * package.json is not part of tsconfig's include.
 *
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
	root: true,

	env: {
		browser: true,
		es6: true,
		node: true,
	},

	parser: '@typescript-eslint/parser',

	parserOptions: {
		project: ['./tsconfig.json'],
		sourceType: 'module',
		extraFileExtensions: ['.json'],
	},

	ignorePatterns: [
		'.eslintrc.js',
		'**/*.js',
		'**/*.mjs',
		'**/node_modules/**',
		'**/dist/**',
	],

	overrides: [
		{
			files: ['package.json'],
			plugins: ['eslint-plugin-n8n-nodes-base'],
			extends: ['plugin:n8n-nodes-base/community'],
			parserOptions: {
				project: null,
			},
		},
		{
			files: ['./credentials/**/*.ts'],
			plugins: ['eslint-plugin-n8n-nodes-base'],
			extends: ['plugin:n8n-nodes-base/credentials'],
		},
		{
			files: ['./nodes/**/*.ts'],
			plugins: ['eslint-plugin-n8n-nodes-base'],
			extends: ['plugin:n8n-nodes-base/nodes'],
		},
	],
};
