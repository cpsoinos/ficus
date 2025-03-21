import { fileURLToPath } from 'node:url';

import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import { config as tsConfig, configs as tsConfigs } from 'typescript-eslint';

const gitignorePath = fileURLToPath(new URL('../../../../.gitignore', import.meta.url));

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
export const config = tsConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...tsConfigs.recommended,
	prettier,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		rules: {
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true
				}
			]
		}
	}
);
