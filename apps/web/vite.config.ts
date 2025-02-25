import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { ViteUsing } from 'vite-plugin-using';

export default defineConfig({
	plugins: [
		sveltekit(),
		// transform using to try finally only when in dev mode
		{
			...ViteUsing(),
			apply: 'serve'
		}
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	esbuild: {
		target: 'es2022'
	}
});
