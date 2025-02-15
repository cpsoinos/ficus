import prettier from 'eslint-config-prettier';
import globals from 'globals';
import pluginJs from '@eslint/js';
import { config as tsConfig, configs as tsConfigs, parser as tsParser } from 'typescript-eslint';
import eslintPluginImportX from 'eslint-plugin-import-x';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { includeIgnoreFile, fixupPluginRules } from '@eslint/compat';
import drizzle from 'eslint-plugin-drizzle';
import { fileURLToPath } from 'node:url';

const gitignorePath = fileURLToPath(new URL('../../.gitignore', import.meta.url));

/** @type {import('@typescript-eslint/utils').TSESLint.Linter.Config} */
const config = tsConfig(
	includeIgnoreFile(gitignorePath),
	{ files: ['**/*.{js,mjs,cjs,ts}'] },
	{ languageOptions: { globals: globals.worker } },
	pluginJs.configs.recommended,
	...tsConfigs.recommended,
	prettier,
	eslintPluginImportX.flatConfigs.recommended,
	eslintPluginImportX.flatConfigs.typescript,
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
