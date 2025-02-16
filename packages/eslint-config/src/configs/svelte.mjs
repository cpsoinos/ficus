import { pluginImportAlias } from '../plugins.mjs';
import { configs as svelte } from 'eslint-plugin-svelte';
import { parser as tsParser } from 'typescript-eslint';

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
export const config = [
	...svelte['flat/recommended'],
	...svelte['flat/prettier'],
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: tsParser
			}
		}
	},
	{
		plugins: { '@dword-design/import-alias': pluginImportAlias },
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
	}
];
