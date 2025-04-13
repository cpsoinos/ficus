import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sentrySvelteKit({
			sourceMapsUploadOptions: {
				org: 'anderapps-96',
				project: 'ficus-web'
			}
		}),
		sveltekit()
	],
	define: {
		__ENABLE_CARTA_SSR_HIGHLIGHTER__: false
	},
	build: {
		sourcemap: true
	}
	// test: {
	// 	include: ['src/**/*.{test,spec}.{js,ts}']
	// }
});
