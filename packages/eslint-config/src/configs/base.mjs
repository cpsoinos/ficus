import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import { includeIgnoreFile } from '@eslint/compat';
import globals from 'globals';
import { config as tsConfig, configs as tsConfigs } from 'typescript-eslint';
import { fileURLToPath } from 'node:url';

const gitignorePath = fileURLToPath(new URL('../../../../.gitignore', import.meta.url));

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
	}
);
