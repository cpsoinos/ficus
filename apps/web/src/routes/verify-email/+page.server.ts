import { fail, redirect } from '@sveltejs/kit';
import {
	createEmailVerificationRequest,
	deleteEmailVerificationRequestCookie,
	deleteUserEmailVerificationRequest,
	getUserEmailVerificationRequestFromRequest,
	sendVerificationEmail,
	setEmailVerificationRequestCookie
} from '$lib/server/email-verification';
// import { invalidateUserPasswordResetSessions } from '$lib/server/password-reset';
import { updateUserEmailAndSetEmailAsVerified } from '$lib/server/user';
import type { Actions, RequestEvent } from './$types';
import { ExpiringTokenBucketProxy } from '$lib/server/rate-limit/ExpiringTokenBucketProxy';

enum VerifyEmailEndpointKeys {
	VERIFY = 'verify',
	RESEND = 'resend'
}

export async function load(event: RequestEvent) {
	if (event.locals.user === null) {
		return redirect(302, '/login');
	}
	let verificationRequest = await getUserEmailVerificationRequestFromRequest(event);
	if (verificationRequest === null || Date.now() >= verificationRequest.expiresAt.getTime()) {
		if (event.locals.user.emailVerified) {
			return redirect(302, '/');
		}
		// Note: We don't need rate limiting since it takes time before requests expire
		verificationRequest = await createEmailVerificationRequest(
			event.locals.user.id,
			event.locals.user.email
		);
		await Promise.all([
			sendVerificationEmail(verificationRequest.email, verificationRequest.code),
			setEmailVerificationRequestCookie(event, verificationRequest)
		]);
	}
	return {
		email: verificationRequest.email
	};
}

// async function getExpiringTokenBucket(userId: string) {
// 	const id = Bindings.env.EXPIRING_TOKEN_BUCKET.idFromName(userId);
// 	const stub = Bindings.env.EXPIRING_TOKEN_BUCKET.get(id);
// 	await stub.fetch('https://ficus-rate-limiter.local/set-params', {
// 		method: 'POST',
// 		body: JSON.stringify({ max: 5, expiresInSeconds: 60 * 30 })
// 	});
// 	return stub;
// }

// async function checkRateLimit(userId: string, key: VerifyEmailEndpointKeys) {
// 	const bucket = await getExpiringTokenBucket(userId);
// 	const resp = await bucket.fetch('https://ficus-rate-limiter.local/check', {
// 		method: 'POST',
// 		body: JSON.stringify({ key, cost: 1 })
// 	});
// 	return resp.json();
// }

// async function consumeExpiringToken(userId: string, key: VerifyEmailEndpointKeys) {
// 	const bucket = await getExpiringTokenBucket(userId);
// 	const resp = await bucket.fetch('https://ficus-rate-limiter.local/consume', {
// 		method: 'POST',
// 		body: JSON.stringify({ key, cost: 1 })
// 	});
// 	return resp.json();
// }

export const actions: Actions = {
	verify: verifyCode,
	resend: resendEmail
};

async function verifyCode(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return fail(401, {
			verify: {
				message: 'Not authenticated'
			}
		});
	}
	// if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
	// 	return fail(403, {
	// 		verify: {
	// 			message: 'Forbidden'
	// 		}
	// 	});
	// }

	const bucket = await ExpiringTokenBucketProxy.initialize({
		name: event.locals.user.id,
		max: 5,
		expiresInSeconds: 60 * 30
	});

	if (!(await bucket.check(VerifyEmailEndpointKeys.VERIFY))) {
		return fail(429, {
			verify: {
				message: 'Too many requests'
			}
		});
	}

	let verificationRequest = await getUserEmailVerificationRequestFromRequest(event);
	if (verificationRequest === null) {
		return fail(401, {
			verify: {
				message: 'Not authenticated'
			}
		});
	}

	const formData = await event.request.formData();
	const code = formData.get('code');
	if (typeof code !== 'string') {
		return fail(400, {
			verify: {
				message: 'Invalid or missing fields'
			}
		});
	}
	if (code === '') {
		return fail(400, {
			verify: {
				message: 'Enter your code'
			}
		});
	}
	// if (!bucket.consume(event.locals.user.id, 1)) {
	if (!(await bucket.consume(VerifyEmailEndpointKeys.VERIFY))) {
		return fail(429, {
			verify: {
				message: 'Too many requests'
			}
		});
	}
	if (Date.now() >= verificationRequest.expiresAt.getTime()) {
		verificationRequest = await createEmailVerificationRequest(
			verificationRequest.userId,
			verificationRequest.email
		);
		await sendVerificationEmail(verificationRequest.email, verificationRequest.code);
		return {
			verify: {
				message: 'The verification code was expired. We sent another code to your inbox.'
			}
		};
	}
	if (verificationRequest.code !== code) {
		return fail(400, {
			verify: {
				message: 'Incorrect code.'
			}
		});
	}
	await Promise.all([
		deleteUserEmailVerificationRequest(event.locals.user.id),
		// invalidateUserPasswordResetSessions(event.locals.user.id),
		updateUserEmailAndSetEmailAsVerified(event.locals.user.id, verificationRequest.email),
		deleteEmailVerificationRequestCookie(event)
	]);

	// if (!event.locals.user.registered2FA) {
	// 	return redirect(302, '/2fa/setup');
	// }
	return redirect(302, '/');
}

async function resendEmail(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return fail(401, {
			resend: {
				message: 'Not authenticated'
			}
		});
	}
	// if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
	// 	return fail(403, {
	// 		resend: {
	// 			message: 'Forbidden'
	// 		}
	// 	});
	// }

	const bucket = await ExpiringTokenBucketProxy.initialize({
		name: event.locals.user.id,
		max: 5,
		expiresInSeconds: 60 * 30
	});

	// if (!sendVerificationEmailBucket.check(event.locals.user.id, 1)) {
	if (!(await bucket.check(VerifyEmailEndpointKeys.RESEND))) {
		return fail(429, {
			resend: {
				message: 'Too many requests'
			}
		});
	}

	let verificationRequest = await getUserEmailVerificationRequestFromRequest(event);
	if (verificationRequest === null) {
		if (event.locals.user.emailVerified) {
			return fail(403, {
				resend: {
					message: 'Forbidden'
				}
			});
		}
		// if (!sendVerificationEmailBucket.consume(event.locals.user.id, 1)) {
		if (!(await bucket.consume(VerifyEmailEndpointKeys.RESEND))) {
			return fail(429, {
				resend: {
					message: 'Too many requests'
				}
			});
		}
		verificationRequest = await createEmailVerificationRequest(
			event.locals.user.id,
			event.locals.user.email
		);
	} else {
		// if (!sendVerificationEmailBucket.consume(event.locals.user.id, 1)) {
		if (!(await bucket.consume(VerifyEmailEndpointKeys.RESEND))) {
			return fail(429, {
				resend: {
					message: 'Too many requests'
				}
			});
		}
		verificationRequest = await createEmailVerificationRequest(
			event.locals.user.id,
			verificationRequest.email
		);
	}

	await Promise.all([
		sendVerificationEmail(verificationRequest.email, verificationRequest.code),
		setEmailVerificationRequestCookie(event, verificationRequest)
	]);

	return {
		resend: {
			message: 'A new code was sent to your inbox.'
		}
	};
}
