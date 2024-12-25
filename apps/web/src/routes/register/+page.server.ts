import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	createSession,
	createUser,
	generateSessionToken,
	setSessionTokenCookie,
	validateEmail
} from '$lib/server/auth';
import { hashPassword, verifyPasswordStrength } from '$lib/server/password';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	register: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email) {
			return fail(400, { email, missing: true });
		}
		if (!password) {
			return fail(400, { message: 'Password is required' });
		}

		if (!validateEmail(email)) {
			return fail(400, { message: 'Invalid email' });
		}
		if (!verifyPasswordStrength(password)) {
			return fail(400, { message: 'Invalid password' });
		}

		// const hashResp = await event.platform!.env.ARGON2.fetch('http://internal/hash', {
		// 	method: 'POST',
		// 	body: JSON.stringify({ password })
		// });
		// const resp = await hashResp.json<{ hash: string }>();
		// const passwordHash = resp.hash;
		const passwordHash = await hashPassword(password);

		try {
			const { id: userId } = await createUser({ email, passwordHash });

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
