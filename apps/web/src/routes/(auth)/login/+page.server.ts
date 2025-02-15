import {
	createSession,
	generateSessionToken,
	setSessionTokenCookie,
	type SessionFlags
} from '$lib/server/session';
import { verifyPassword } from '$lib/server/password';
import { verifyEmailInput } from '$lib/server/email';
import { RefillingTokenBucketProxy } from '$lib/server/rate-limit/RefillingTokenBucketProxy';
import { ThrottlerProxy } from '$lib/server/rate-limit/ThrottlerProxy';
import { getUserFromEmail, getUserPasswordHash } from '$lib/server/user';
import { getOAuthAccountsForUser, getOAuthProviderName } from '$lib/server/oauth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad, RequestEvent } from './$types';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}
	return {};
};

const REFILL_RATE = 1;
const CAPACITY = 20;
const UPDATE_MS = 1000;
const TIMEOUT_SECONDS = [0, 1, 2, 4, 8, 16, 30, 60, 180, 300];

export const actions: Actions = {
	login
};

async function login(event: RequestEvent) {
	const clientIP = event.getClientAddress();
	const ipBucket = await RefillingTokenBucketProxy.initialize({
		name: `${clientIP}:login`,
		refillRate: REFILL_RATE,
		capacity: CAPACITY,
		updateMs: UPDATE_MS
	});
	if (!(await ipBucket.check(1))) {
		return fail(429, {
			message: 'Rate limit exceeded',
			email: ''
		});
	}

	const formData = await event.request.formData();
	const email = formData.get('email');
	const password = formData.get('password');
	if (typeof email !== 'string' || typeof password !== 'string') {
		return fail(400, {
			message: 'Invalid or missing fields',
			email: ''
		});
	}
	if (email === '' || password === '') {
		return fail(400, {
			message: 'Please enter your email and password.',
			email
		});
	}
	if (!verifyEmailInput(email)) {
		return fail(400, {
			message: 'Invalid email',
			email
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

	if (!(await ipBucket.consume(1))) {
		return fail(429, {
			message: 'Too many requests',
			email: ''
		});
	}

	const throttler = await ThrottlerProxy.initialize({
		name: user.id,
		timeoutSeconds: TIMEOUT_SECONDS
	});
	if (!(await throttler.consume())) {
		return fail(429, {
			message: 'Too many requests',
			email: ''
		});
	}

	const passwordHash = await getUserPasswordHash(user.id);
	if (!passwordHash) {
		// user signed up with social login. find which provider and say to login using that
		const oauthAccounts = await getOAuthAccountsForUser(user.id);

		if (oauthAccounts.length === 0) {
			return fail(400, {
				message: 'No password set for this account',
				email
			});
		}

		const providerName = getOAuthProviderName(oauthAccounts[0].provider);
		return fail(400, {
			message: `Please login using ${providerName}`,
			email
		});
	}

	const validPassword = await verifyPassword(passwordHash, password);
	if (!validPassword) {
		return fail(400, {
			message: 'Invalid password',
			email
		});
	}

	await throttler.reset();
	const sessionFlags: SessionFlags = {
		twoFactorVerified: false
	};
	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, user.id, sessionFlags);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);

	if (!user.emailVerified) {
		return redirect(302, '/verify-email');
	}

	if (!user.registered2FA) {
		return redirect(302, '/2fa/setup');
	}

	return redirect(302, '/2fa');
}
