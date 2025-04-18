import { verifyTOTP } from '@oslojs/otp';
import { fail, redirect } from '@sveltejs/kit';

import {
	getTotpBucket,
	getRecoveryCodeBucket,
	resetUser2FAWithRecoveryCode
} from '$lib/server/auth/2fa';
import {
	validatePasswordResetSessionRequest,
	setPasswordResetSessionAs2FAVerified
} from '$lib/server/auth/password-reset';
import { getUserTOTPKey } from '$lib/server/auth/user';

import type { Actions, RequestEvent } from './$types';

export async function load(event: RequestEvent) {
	const { session, user } = await validatePasswordResetSessionRequest(event);

	if (session === null) {
		return redirect(302, '/forgot-password');
	}
	if (!session.emailVerified) {
		return redirect(302, '/reset-password/verify-email');
	}
	if (!user.registered2FA) {
		return redirect(302, '/reset-password');
	}
	if (session.twoFactorVerified) {
		return redirect(302, '/reset-password');
	}
	return {};
}

export const actions: Actions = {
	totp: totpAction,
	recovery_code: recoveryCodeAction
};

async function totpAction(event: RequestEvent) {
	const { session, user } = await validatePasswordResetSessionRequest(event);
	if (session === null) {
		return fail(401, {
			totp: {
				message: 'Not authenticated'
			}
		});
	}
	if (!session.emailVerified || !user.registered2FA || session.twoFactorVerified) {
		return fail(403, {
			totp: {
				message: 'Forbidden'
			}
		});
	}

	const totpBucket = await getTotpBucket(session.userId);

	if (!(await totpBucket.check('totp', 1))) {
		return fail(429, {
			totp: {
				message: 'Too many requests'
			}
		});
	}

	const formData = await event.request.formData();
	const code = formData.get('code');
	if (typeof code !== 'string') {
		return fail(400, {
			totp: {
				message: 'Invalid or missing fields'
			}
		});
	}
	if (code === '') {
		return fail(400, {
			totp: {
				message: 'Please enter your code'
			}
		});
	}
	const totpKey = await getUserTOTPKey(session.userId);
	if (totpKey === null) {
		return fail(403, {
			totp: {
				message: 'Forbidden'
			}
		});
	}
	if (!(await totpBucket.consume('totp', 1))) {
		return fail(429, {
			totp: {
				message: 'Too many requests'
			}
		});
	}
	if (!verifyTOTP(totpKey, 30, 6, code)) {
		return fail(400, {
			totp: {
				message: 'Invalid code'
			}
		});
	}

	await totpBucket.reset('totp');
	await setPasswordResetSessionAs2FAVerified(session.id);

	return redirect(302, '/reset-password');
}

async function recoveryCodeAction(event: RequestEvent) {
	const { session, user } = await validatePasswordResetSessionRequest(event);
	if (session === null) {
		return fail(401, {
			recoveryCode: {
				message: 'Not authenticated'
			}
		});
	}
	if (!session.emailVerified || !user.registered2FA || session.twoFactorVerified) {
		return fail(403, {
			totp: {
				message: 'Forbidden'
			}
		});
	}

	const recoveryCodeBucket = await getRecoveryCodeBucket(session.userId);

	if (!(await recoveryCodeBucket.check('recovery-code', 1))) {
		return fail(429, {
			recoveryCode: {
				message: 'Too many requests'
			}
		});
	}

	const formData = await event.request.formData();
	const code = formData.get('code');
	if (typeof code !== 'string') {
		return fail(400, {
			recoveryCode: {
				message: 'Invalid or missing fields'
			}
		});
	}
	if (code === '') {
		return fail(400, {
			recoveryCode: {
				message: 'Please enter your code'
			}
		});
	}
	if (!(await recoveryCodeBucket.consume('recovery-code', 1))) {
		return fail(429, {
			recoveryCode: {
				message: 'Too many requests'
			}
		});
	}

	const valid = await resetUser2FAWithRecoveryCode(session.userId, code);
	if (!valid) {
		return fail(400, {
			recoveryCode: {
				message: 'Invalid code'
			}
		});
	}

	await recoveryCodeBucket.reset('recovery-code');

	return redirect(302, '/reset-password');
}
