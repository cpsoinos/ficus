import {
	createEmailVerificationRequest,
	sendVerificationEmail,
	getEmailVerificationBucket,
	setEmailVerificationRequestCookie
} from '$lib/server/email-verification';
import { fail, redirect } from '@sveltejs/kit';
import { checkEmailAvailability, verifyEmailInput } from '$lib/server/email';
import {
	getPasswordUpdateBucket,
	verifyPassword,
	verifyPasswordStrength
} from '$lib/server/password';
import { getUserPasswordHash, getUserRecoverCode, updateUserPassword } from '$lib/server/user';
import {
	createSession,
	generateSessionToken,
	invalidateUserSessions,
	setSessionTokenCookie
} from '$lib/server/session';
import type { Actions, RequestEvent } from './$types';
import type { SessionFlags } from '$lib/server/session';

// const passwordUpdateBucket = new ExpiringTokenBucket<string>(5, 60 * 30);

export async function load(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}
	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		return redirect(302, '/2fa');
	}
	let recoveryCode: string | null = null;
	if (event.locals.user.registered2FA) {
		recoveryCode = await getUserRecoverCode(event.locals.user.id);
	}
	return {
		recoveryCode,
		user: event.locals.user
	};
}

export const actions: Actions = {
	password: updatePasswordAction,
	email: updateEmailAction
};

async function updatePasswordAction(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return fail(401, {
			password: {
				message: 'Not authenticated'
			}
		});
	}
	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		return fail(403, {
			password: {
				message: 'Forbidden'
			}
		});
	}

	const passwordUpdateBucket = await getPasswordUpdateBucket(event.locals.user.id);

	if (!(await passwordUpdateBucket.check('password-update', 1))) {
		return fail(429, {
			password: {
				message: 'Too many requests'
			}
		});
	}

	const formData = await event.request.formData();

	const password = formData.get('password');
	const newPassword = formData.get('new_password');

	// Determine whether the user already has a password. If they do, we're updating it. If they do not, they signed up via oauth, and so we're adding a password.
	const passwordHash = await getUserPasswordHash(event.locals.user.id);
	const hasPassword = !!passwordHash;

	if (hasPassword) {
		if (typeof password !== 'string' || typeof newPassword !== 'string') {
			return fail(400, {
				password: {
					message: 'Invalid or missing fields'
				}
			});
		}
		const validPassword = await verifyPassword(passwordHash, password);
		if (!validPassword) {
			return fail(400, {
				password: {
					message: 'Incorrect password'
				}
			});
		}
	} else {
		// TODO: password reset flow
	}

	if (typeof newPassword !== 'string') {
		return fail(400, {
			password: {
				message: 'Invalid or missing fields'
			}
		});
	}

	const isStrongPassword = await verifyPasswordStrength(newPassword);
	if (!isStrongPassword) {
		return fail(400, {
			password: {
				message: 'Weak password'
			}
		});
	}

	if (!(await passwordUpdateBucket.consume('password-update', 1))) {
		return fail(429, {
			password: {
				message: 'Too many requests'
			}
		});
	}

	await passwordUpdateBucket.reset('password-update');
	await invalidateUserSessions(event.locals.user.id);
	await updateUserPassword(event.locals.user.id, newPassword);

	const sessionToken = generateSessionToken();
	const sessionFlags: SessionFlags = {
		twoFactorVerified: event.locals.session.twoFactorVerified
	};
	const session = await createSession(sessionToken, event.locals.user.id, sessionFlags);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);

	return {
		password: {
			message: 'Updated password'
		}
	};
}

async function updateEmailAction(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return fail(401, {
			email: {
				message: 'Not authenticated'
			}
		});
	}
	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		return fail(403, {
			email: {
				message: 'Forbidden'
			}
		});
	}

	const sendVerificationEmailBucket = await getEmailVerificationBucket(event.locals.user.id);

	if (!(await sendVerificationEmailBucket.check(event.locals.user.id, 1))) {
		return fail(429, {
			email: {
				message: 'Too many requests'
			}
		});
	}

	const formData = await event.request.formData();
	const email = formData.get('email');
	if (typeof email !== 'string') {
		return fail(400, {
			email: {
				message: 'Invalid or missing fields'
			}
		});
	}
	if (email === '') {
		return fail(400, {
			email: {
				message: 'Please enter your email'
			}
		});
	}
	if (!verifyEmailInput(email)) {
		return fail(400, {
			email: {
				message: 'Please enter a valid email'
			}
		});
	}
	const emailAvailable = await checkEmailAvailability(email);
	if (!emailAvailable) {
		return fail(400, {
			email: {
				message: 'This email is already used'
			}
		});
	}
	if (!(await sendVerificationEmailBucket.consume(event.locals.user.id, 1))) {
		return fail(429, {
			email: {
				message: 'Too many requests'
			}
		});
	}
	const verificationRequest = await createEmailVerificationRequest(event.locals.user.id, email);
	await sendVerificationEmail(verificationRequest.email, verificationRequest.code);
	setEmailVerificationRequestCookie(event, verificationRequest);

	return redirect(302, '/verify-email');
}
