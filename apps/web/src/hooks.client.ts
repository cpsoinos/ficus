import * as Sentry from '@sentry/sveltekit';

import type { HandleClientError } from '@sveltejs/kit';

import { dev } from '$app/environment';

if (!dev) {
	Sentry.init({
		dsn: 'https://0b7dd9fb35e2c89bf9673c2af0a8e234@o4508996084039680.ingest.us.sentry.io/4508996087054336',

		// We recommend adjusting this value in production, or using tracesSampler
		// for finer control
		tracesSampleRate: 1.0,

		// Optional: Initialize Session Replay:
		integrations: [Sentry.replayIntegration()],
		replaysSessionSampleRate: 0.1,
		replaysOnErrorSampleRate: 1.0
	});
}

const myErrorHandler: HandleClientError = ({ error, event }) => {
	console.error('An error occurred on the client side:', error, event);
};

export const handleError = dev ? myErrorHandler : Sentry.handleErrorWithSentry(myErrorHandler);

// or alternatively, if you don't have a custom error handler:
// export const handleError = handleErrorWithSentry();
