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

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	register: async (event) => {
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
