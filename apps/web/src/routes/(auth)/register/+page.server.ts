import { fail, redirect } from '@sveltejs/kit';

import { checkEmailAvailability, verifyEmailInput } from '$lib/server/auth/email';
import {
	createEmailVerificationRequest,
	sendVerificationEmail,
	setEmailVerificationRequestCookie
} from '$lib/server/auth/email-verification';
import { verifyPasswordStrength } from '$lib/server/auth/password';
import {
	createSession,
	generateSessionToken,
	setSessionTokenCookie,
	type SessionFlags
} from '$lib/server/auth/session';
import { createUser } from '$lib/server/auth/user';
import { RefillingTokenBucketProxy } from '$lib/server/rate-limit/RefillingTokenBucketProxy';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}
	return {};
};

const REFILL_RATE = 1;
const CAPACITY = 3;
const UPDATE_MS = 10000;

export const actions: Actions = {
	register: async (event) => {
		const clientIP = event.getClientAddress();
		const bucket = await RefillingTokenBucketProxy.initialize({
			name: `${clientIP}:register`,
			refillRate: REFILL_RATE,
			capacity: CAPACITY,
			updateMs: UPDATE_MS
		});

		const { allowed, remainingTokens, nextRefillTime } = await bucket.consume();
		if (!allowed) {
			console.warn(`Rate limit exceeded for IP: ${clientIP}`, {
				route: '/register',
				clientIP,
				remainingTokens,
				...(nextRefillTime && {
					nextRefillTime: new Date(nextRefillTime).toISOString(),
					nextRefillIn: nextRefillTime - Date.now()
				})
			});
			return fail(429, { message: 'Rate limit exceeded' });
		}

		const formData = await event.request.formData();
		const email = formData.get('email') as string | undefined;
		const password = formData.get('password') as string | undefined;

		if (!email) {
			return fail(400, { email, missing: true });
		}
		if (!password) {
			return fail(400, { message: 'Password is required' });
		}

		if (!verifyEmailInput(email)) {
			return fail(400, { message: 'Invalid email' });
		}
		if (!verifyPasswordStrength(password)) {
			return fail(400, { message: 'Weak password' });
		}

		const emailAvailable = await checkEmailAvailability(email);
		if (!emailAvailable) {
			return fail(400, {
				message: 'Email is already used',
				email
			});
		}

		try {
			const { id: userId } = await createUser({ email, password });

			const emailVerificationRequest = await createEmailVerificationRequest(userId, email);
			await sendVerificationEmail(emailVerificationRequest.email, emailVerificationRequest.code);
			setEmailVerificationRequestCookie(event, emailVerificationRequest);

			const sessionToken = generateSessionToken();
			const sessionFlags: SessionFlags = {
				twoFactorVerified: false
			};
			const session = await createSession(sessionToken, userId, sessionFlags);
			setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'An error has occurred' });
		}
		return redirect(302, '/');
	}
};
