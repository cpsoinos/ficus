import { fail, redirect } from '@sveltejs/kit';
import { and, eq, isNotNull } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';
import {
	createSession,
	generateSessionToken,
	setSessionTokenCookie,
	validatePassword
} from '$lib/server/auth';
import { verifyPassword } from '$lib/server/password';
import { verifyEmailInput } from '$lib/server/email';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	login: async (event) => {
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
		if (!validatePassword(password)) {
			return fail(400, { message: 'Invalid password' });
		}

		const [existingUser] = await db
			.select()
			.from(table.user)
			.where(and(eq(table.user.email, email), isNotNull(table.user.passwordHash)));

		if (!existingUser) {
			return fail(400, { message: 'Incorrect email or password' });
		}

		const validPassword = await verifyPassword(existingUser.passwordHash!, password);
		if (!validPassword) {
			return fail(400, { message: 'Incorrect email or password' });
		}

		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser.id);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return redirect(302, '/');
	}
};
