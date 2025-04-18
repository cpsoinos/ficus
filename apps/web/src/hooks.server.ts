import {
	handleErrorWithSentry,
	sentryHandle,
	initCloudflareSentryHandle,
	setUser as sentrySetUser
} from '@sentry/sveltekit';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { preloadIcons } from './lib/icons';
import {
	sessionCookieName,
	validateSessionToken,
	setSessionTokenCookie,
	deleteSessionTokenCookie
} from './lib/server/auth/session';
import { BindingsSingleton } from './lib/server/bindings';
import { DbSingleton } from './lib/server/db';

import { dev } from '$app/environment';

const initBindings: Handle = async ({ event, resolve }) => {
	BindingsSingleton.initialize(event.platform!.env);
	return resolve(event);
};

const initDb: Handle = async ({ event, resolve }) => {
	DbSingleton.initialize(event.platform!.env.DB);
	return resolve(event);
};

const iconsHook: Handle = async ({ event, resolve }) => {
	await preloadIcons();
	return resolve(event);
};

const authHook: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(sessionCookieName);
	const { session, user } = sessionToken
		? await validateSessionToken(sessionToken)
		: { session: null, user: null };

	if (session) {
		setSessionTokenCookie(event, sessionToken!, session.expiresAt);
	} else {
		deleteSessionTokenCookie(event);
	}

	if (user) {
		sentrySetUser({
			id: user.id,
			email: user.email,
			ip_address: event.getClientAddress(),
			geo: {
				country_code: event.platform?.cf.country as string | undefined,
				region: event.platform?.cf.region as string | undefined,
				city: event.platform?.cf.city as string | undefined
			}
		});
	} else {
		sentrySetUser(null);
	}

	event.locals.user = user;
	event.locals.session = session;

	if (event.route.id?.startsWith('/(protected)')) {
		if (session === null || user === null) {
			return redirect(302, '/login');
		}
		if (!user.emailVerified) {
			return redirect(302, '/verify-email');
		}
		if (!user.registered2FA) {
			return redirect(302, '/2fa/setup');
		}
		if (!session.twoFactorVerified) {
			return redirect(302, '/2fa');
		}
	}

	return resolve(event);
};

export const handleError = handleErrorWithSentry();

const handlers = [
	...(dev
		? []
		: [
				initCloudflareSentryHandle({
					dsn: 'https://12974ab20425bb602572ca34045db540@o4509062120865792.ingest.us.sentry.io/4509062125780992',
					tracesSampleRate: 1.0
				}),
				sentryHandle()
			]),
	initBindings,
	initDb,
	iconsHook,
	authHook
];

export const handle: Handle = sequence(...handlers);
