import { fail, redirect } from '@sveltejs/kit';

import { verifyEmailInput } from '$lib/server/auth/email';
import {
	createPasswordResetSession,
	getIpBucket,
	getUserBucket,
	invalidateUserPasswordResetSessions,
	sendPasswordResetEmail,
	setPasswordResetSessionTokenCookie
} from '$lib/server/auth/password-reset';
import { generateSessionToken } from '$lib/server/auth/session';
import { getUserFromEmail } from '$lib/server/auth/user';

import type { Actions, RequestEvent } from './$types';

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	const clientIP = event.getClientAddress();
	const ipBucket = await getIpBucket(clientIP);
	if (!(await ipBucket.check(1))) {
		return fail(429, {
			message: 'Too many requests',
			email: ''
		});
	}

	const formData = await event.request.formData();
	const email = formData.get('email');
	if (typeof email !== 'string') {
		return fail(400, {
			message: 'Invalid or missing fields',
			email: ''
		});
	}
	if (!verifyEmailInput(email)) {
		return fail(400, {
			message: 'Invalid email',
			email
		});
	}
	const user = await getUserFromEmail(email);
	if (user === null) {
		return fail(400, {
			message: 'Account does not exist',
			email
		});
	}
	if (clientIP !== null && !(await ipBucket.consume(1))) {
		return fail(400, {
			message: 'Too many requests',
			email
		});
	}

	const userBucket = await getUserBucket(user.id);

	if (!(await userBucket.consume(1))) {
		return fail(400, {
			message: 'Too many requests',
			email
		});
	}

	await invalidateUserPasswordResetSessions(user.id);
	const sessionToken = generateSessionToken();
	const session = await createPasswordResetSession(sessionToken, user.id, user.email);
	await sendPasswordResetEmail(session.email, session.code);
	setPasswordResetSessionTokenCookie(event, sessionToken, session.expiresAt);

	return redirect(302, '/reset-password/verify-email');
}
