import { DbSingleton } from './lib/server/db';
import { BindingsSingleton } from './lib/server/bindings';
import {
	sessionCookieName,
	validateSessionToken,
	setSessionTokenCookie,
	deleteSessionTokenCookie
} from './lib/server/auth/session';
import { preloadIcons } from './lib/icons';
import { sequence } from '@sveltejs/kit/hooks';
import { redirect, type Handle } from '@sveltejs/kit';

const initDb: Handle = async ({ event, resolve }) => {
	DbSingleton.initialize(event.platform!.env.DB);
	return resolve(event);
};

const initBindings: Handle = async ({ event, resolve }) => {
	BindingsSingleton.initialize(event.platform!.env);
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

export const handle: Handle = sequence(initBindings, initDb, iconsHook, authHook);
