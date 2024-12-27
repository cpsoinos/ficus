import { dev } from '$app/environment';
import type { Handle } from '@sveltejs/kit';
import { DbSingleton } from '$lib/server/db';
import { sequence } from '@sveltejs/kit/hooks';
import { Bindings } from '$lib/server/bindings';
import {
	sessionCookieName,
	validateSessionToken,
	setSessionTokenCookie,
	deleteSessionTokenCookie
} from '$lib/server/auth';

let platform: App.Platform;

const devShim: Handle = async ({ event, resolve }) => {
	if (dev) {
		const { getPlatformProxy } = await import('wrangler');
		platform = (await getPlatformProxy<Env>()) as unknown as App.Platform;
		event.platform = {
			...event.platform,
			...platform
		};
	}
	return resolve(event);
};

const initDb: Handle = async ({ event, resolve }) => {
	DbSingleton.initialize(event.platform!.env.DB);
	return resolve(event);
};

const initBindings: Handle = async ({ event, resolve }) => {
	Bindings.initialize(event.platform!.env);
	return resolve(event);
};

const authHook: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(sessionCookieName);
	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await validateSessionToken(sessionToken);
	if (session) {
		setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};

export const handle: Handle = sequence(devShim, initBindings, initDb, authHook);
