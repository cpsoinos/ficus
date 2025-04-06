import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sentrySvelteKit(), sveltekit()],
	define: {
		__ENABLE_CARTA_SSR_HIGHLIGHTER__: false
	},
	build: {
		sourcemap: true
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
