import { fail, redirect } from '@sveltejs/kit';
import { and, eq, isNotNull } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';
import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/auth';
import { verifyPassword } from '$lib/server/password';
import { verifyEmailInput } from '$lib/server/email';
import { RefillingTokenBucketProxy } from '$lib/server/rate-limit/RefillingTokenBucketProxy';
import { ThrottlerProxy } from '$lib/server/rate-limit/ThrottlerProxy';

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
	login: async (event) => {
		const clientIP = event.getClientAddress();
		const ipBucket = await RefillingTokenBucketProxy.initialize({
			name: `${clientIP}:login`,
			refillRate: REFILL_RATE,
			capacity: CAPACITY,
			updateMs: UPDATE_MS
		});
		if (!(await ipBucket.check(1))) {
			return fail(429, { message: 'Rate limit exceeded', email: '' });
		}

		const formData = await event.request.formData();
		const email = formData.get('email') as string | undefined;
		const password = formData.get('password') as string | undefined;

		if (!email) {
			return fail(400, { message: 'Email is required', email: '' });
		}
		if (!password) {
			return fail(400, { message: 'Password is required', email });
		}

		if (!verifyEmailInput(email)) {
			return fail(400, { message: 'Invalid email', email });
		}

		const [existingUser] = await db
			.select()
			.from(table.user)
			.where(and(eq(table.user.email, email), isNotNull(table.user.passwordHash)));

		if (!existingUser) {
			return fail(400, { message: 'Incorrect email or password' });
		}

		if (!(await ipBucket.consume(1))) {
			return fail(429, { message: 'Too many requests', email: '' });
		}

		const throttler = await ThrottlerProxy.initialize({
			name: existingUser.id,
			timeoutSeconds: TIMEOUT_SECONDS
		});
		if (!(await throttler.consume())) {
			return fail(429, { message: 'Too many requests', email: '' });
		}

		const validPassword = await verifyPassword(existingUser.passwordHash!, password);
		if (!validPassword) {
			return fail(400, { message: 'Invalid password', email });
		}

		await throttler.reset();
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser.id);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return redirect(302, '/');
	}
};
