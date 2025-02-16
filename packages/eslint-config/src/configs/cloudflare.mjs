/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
export const config = [
	{
		rules: {
			'import-x/no-unresolved': [
				'error',
				{
					ignore: [
						// Cloudflare aliases
						'cloudflare:(test|workers)'
					]
				}
			]
		}
	}
];
