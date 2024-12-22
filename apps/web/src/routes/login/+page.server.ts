import { verify } from '@node-rs/argon2';
import { fail, redirect } from '@sveltejs/kit';
import { and, eq, isNotNull } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';
import {
	createSession,
	generateSessionToken,
	setSessionTokenCookie,
	validateEmail,
	validatePassword
} from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	login: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email');
		const password = formData.get('password');

		if (!validateEmail(email)) {
			return fail(400, { message: 'Invalid email' });
		}
		if (!validatePassword(password)) {
			return fail(400, { message: 'Invalid password' });
		}

		const existingUser = await db.query.user.findFirst({
			where: and(eq(table.user.email, email), isNotNull(table.user.passwordHash))
		});

		if (!existingUser) {
			return fail(400, { message: 'Incorrect email or password' });
		}

		const validPassword = await verify(existingUser.passwordHash!, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
		if (!validPassword) {
			return fail(400, { message: 'Incorrect email or password' });
		}

		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser.id);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return redirect(302, '/');
	}
};
