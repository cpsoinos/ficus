import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import { includeIgnoreFile, fixupPluginRules } from '@eslint/compat';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { config as tsConfig, configs as tsConfigs, parser as tsParser } from 'typescript-eslint';
import drizzle from 'eslint-plugin-drizzle';
// import eslintPluginImportX from 'eslint-plugin-import-x';
// import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import eslintPluginImportAlias from '@dword-design/eslint-plugin-import-alias';
import { fileURLToPath } from 'node:url';
import { type TSESLint } from '@typescript-eslint/utils';

const gitignorePath = fileURLToPath(new URL('../../.gitignore', import.meta.url));

const config: TSESLint.Linter.ConfigType = tsConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...tsConfigs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: tsParser
			}
		}
	},

	// eslintPluginImportX.flatConfigs.recommended,
	// eslintPluginImportX.flatConfigs.typescript,
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
					alwaysTryTypes: true,
					project: ['./tsconfig.json']
				})
			]
		}
	},
	{
		plugins: { '@dword-design/import-alias': eslintPluginImportAlias },
		rules: {
			'@dword-design/import-alias/prefer-alias': [
				'error',
				{
					alias: {
						$lib: './src/lib'
					}
				}
			]
		}
	},
	{
		plugins: {
			drizzle: fixupPluginRules(drizzle)
		},
		rules: {
			'drizzle/enforce-delete-with-where': 'error',
			'drizzle/enforce-update-with-where': 'error'
		}
	}
);

export default config;
