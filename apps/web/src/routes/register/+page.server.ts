import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/auth';
import { createUser } from '$lib/server/user';
import { verifyPasswordStrength } from '$lib/server/password';
import { checkEmailAvailability, verifyEmailInput } from '$lib/server/email';
import {
	createEmailVerificationRequest,
	sendVerificationEmail,
	setEmailVerificationRequestCookie
} from '$lib/server/email-verification';
import { Bindings } from '$lib/server/bindings';
import type { RefillingTokenBucket } from '@ficus/rate-limiter/src';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}
	return {};
};

const REFILL_RATE = 1;
const CAPACITY = 3;
const UPDATE_MS = 10000;

async function getIpBucket(ip: string | null): Promise<DurableObjectStub<RefillingTokenBucket>> {
	const name = `${ip}:register`;
	const id = Bindings.env.REFILLING_TOKEN_BUCKET.idFromName(name);
	const stub = Bindings.env.REFILLING_TOKEN_BUCKET.get(id);
	// stub.setParams({ refillRate: REFILL_RATE, capacity: CAPACITY, updateMs: UPDATE_MS });
	await stub.fetch('https://ficus-rate-limiter.local/set-params', {
		method: 'POST',
		body: JSON.stringify({ refillRate: REFILL_RATE, capacity: CAPACITY, updateMs: UPDATE_MS })
	});
	return stub;
}

async function checkIpRateLimit(
	ip: string | null
): Promise<{ allowed: boolean; remainingTokens: number; nextRefillTime?: number }> {
	const ipBucket = await getIpBucket(ip);
	// return ipBucket.consume(1);
	const resp = await ipBucket.fetch('https://ficus-rate-limiter.local/consume', {
		method: 'POST',
		body: JSON.stringify({ tokens: 1 })
	});
	return resp.json();
}

export const actions: Actions = {
	register: async (event) => {
		const clientIP = event.getClientAddress();
		const { allowed, remainingTokens, nextRefillTime } = await checkIpRateLimit(clientIP);
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
			const session = await createSession(sessionToken, userId);
			setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'An error has occurred' });
		}
		return redirect(302, '/');
	}
};
