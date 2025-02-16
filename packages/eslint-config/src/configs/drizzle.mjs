import { pluginDrizzle } from '../plugins.mjs';

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
