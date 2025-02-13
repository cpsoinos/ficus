import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { invalidateSession, deleteSessionTokenCookie } from '$lib/server/auth/session';

export const load: PageServerLoad = async (event) => {
	// if (event.locals.session === null || event.locals.user === null) {
	// 	return redirect(302, '/login');
	// }
	// if (!event.locals.user.emailVerified) {
	// 	return redirect(302, '/verify-email');
	// }
	// if (!event.locals.user.registered2FA) {
	// 	return redirect(302, '/2fa/setup');
	// }
	// if (!event.locals.session.twoFactorVerified) {
	// 	return redirect(302, '/2fa');
	// }
	return {
		user: event.locals.user!
	};
};

export const actions: Actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await invalidateSession(event.locals.session.id);
		deleteSessionTokenCookie(event);

		return redirect(302, '/login');
	}
};
