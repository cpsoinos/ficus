import { decodeBase64, encodeBase64 } from '@oslojs/encoding';
import { createTOTPKeyURI, verifyTOTP } from '@oslojs/otp';
import { fail, redirect } from '@sveltejs/kit';
import { renderSVG } from 'uqr';

import { getTotpUpdateBucket } from '$lib/server/auth/2fa';
import { setSessionAs2FAVerified } from '$lib/server/auth/session';
import { updateUserTOTPKey } from '$lib/server/auth/user';

import type { Actions, RequestEvent } from './$types';

export async function load(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}
	if (!event.locals.user.emailVerified) {
		return redirect(302, '/verify-email');
	}
	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		return redirect(302, '/2fa');
	}

	const totpKey = new Uint8Array(20);
	crypto.getRandomValues(totpKey);
	const encodedTOTPKey = encodeBase64(totpKey);
	const keyURI = createTOTPKeyURI('Ficus', event.locals.user.email, totpKey, 30, 6);
	const qrcode = renderSVG(keyURI);

	return {
		encodedTOTPKey,
		qrcode
	};
}

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return fail(401, {
			message: 'Not authenticated'
		});
	}
	if (!event.locals.user.emailVerified) {
		return fail(403, {
			message: 'Forbidden'
		});
	}
	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		return fail(403, {
			message: 'Forbidden'
		});
	}

	const totpUpdateBucket = await getTotpUpdateBucket(event.locals.user.id);

	if (!(await totpUpdateBucket.check(1))) {
		return fail(429, {
			message: 'Too many requests'
		});
	}

	const formData = await event.request.formData();
	const encodedKey = formData.get('key');
	const code = formData.get('code');
	if (typeof encodedKey !== 'string' || typeof code !== 'string') {
		return fail(400, {
			message: 'Invalid or missing fields'
		});
	}
	if (code === '') {
		return fail(400, {
			message: 'Please enter your code'
		});
	}
	if (encodedKey.length !== 28) {
		return fail(400, {
			message: 'Please enter your code'
		});
	}
	let key: Uint8Array;
	try {
		key = decodeBase64(encodedKey);
	} catch {
		return fail(400, {
			message: 'Invalid key'
		});
	}
	if (key.byteLength !== 20) {
		return fail(400, {
			message: 'Invalid key'
		});
	}
	if (!(await totpUpdateBucket.consume(1))) {
		return fail(429, {
			message: 'Too many requests'
		});
	}
	if (!verifyTOTP(key, 30, 6, code)) {
		return fail(400, {
			message: 'Invalid code'
		});
	}

	await Promise.all([
		updateUserTOTPKey(event.locals.session.userId, key),
		setSessionAs2FAVerified(event.locals.session.id)
	]);

	return redirect(302, '/recovery-code');
}
