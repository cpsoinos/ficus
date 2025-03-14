import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import pluginImportX from 'eslint-plugin-import-x';
import { parser as tsParser } from 'typescript-eslint';

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
export const config = [
	pluginImportX.flatConfigs.recommended,
	pluginImportX.flatConfigs.typescript,
	{
		files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx,svelte}'],
		languageOptions: {
			parserOptions: {
				parser: tsParser
			}
		},
		rules: {
			'no-unused-vars': 'off',
			'import-x/no-dynamic-require': 'warn',
			'import-x/no-nodejs-modules': 'off',
			'import-x/namespace': ['error', { allowComputed: true }],
			'import-x/order': [
				'error',
				{
					groups: [
						'builtin',
						'external',
						'internal',
						'parent',
						'sibling',
						'index',
						'object',
						'type'
					],
					alphabetize: {
						order: 'asc'
					},
					'newlines-between': 'always'
				}
			],
			'import-x/newline-after-import': 'error'
		},
		settings: {
			'import-x/resolver-next': [
				createTypeScriptImportResolver({
					alwaysTryTypes: true
				})
			]
		}
	}
];
