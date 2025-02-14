import { getUserRecoverCode } from '$lib/server/auth/user';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}
	if (!event.locals.user.emailVerified) {
		return redirect(302, '/verify-email');
	}
	if (!event.locals.user.registered2FA) {
		return redirect(302, '/2fa/setup');
	}
	if (!event.locals.session.twoFactorVerified) {
		return redirect(302, '/2fa');
	}
	const recoveryCode = await getUserRecoverCode(event.locals.user.id);

	return {
		recoveryCode
	};
};
