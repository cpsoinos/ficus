import { parser as tsParser } from 'typescript-eslint';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import pluginImportX from 'eslint-plugin-import-x';

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
			'import-x/order': [
				'error',
				{
					groups: [
						'index',
						'sibling',
						'parent',
						'internal',
						'external',
						'builtin',
						'object',
						'type'
					]
				}
			],
			'import-x/no-unresolved': [
				'error',
				{
					ignore: [
						'\\$app\\/(forms|environment|navigation|paths|server|state|stores)',
						'\\$env\\/(dynamic|static)\\/(private|public)'
					]
				}
			]
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
