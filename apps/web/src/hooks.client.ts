import * as Sentry from '@sentry/sveltekit';

import type { HandleClientError } from '@sveltejs/kit';

import { dev } from '$app/environment';

if (!dev) {
	Sentry.init({
		dsn: 'https://12974ab20425bb602572ca34045db540@o4509062120865792.ingest.us.sentry.io/4509062125780992',

		// We recommend adjusting this value in production, or using tracesSampler
		// for finer control
		tracesSampleRate: 1.0,

		// Optional: Initialize Session Replay:
		integrations: [Sentry.replayIntegration()],
		replaysSessionSampleRate: 0.1,
		replaysOnErrorSampleRate: 1.0
	});
}

const devErrorHandler: HandleClientError = ({ error, event }) => {
	console.error('An error occurred on the client side:', error, event);
};

export const handleError = dev ? devErrorHandler : Sentry.handleErrorWithSentry(devErrorHandler);
