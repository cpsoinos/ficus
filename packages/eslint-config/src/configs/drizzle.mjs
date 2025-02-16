import { pluginDrizzle } from '../plugins.mjs';

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
export const config = [
	{
		plugins: {
			drizzle: pluginDrizzle
		},
		rules: {
			'drizzle/enforce-delete-with-where': 'error',
			'drizzle/enforce-update-with-where': 'error'
		}
	}
];
