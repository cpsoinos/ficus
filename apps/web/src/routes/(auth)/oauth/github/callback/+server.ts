import { github, OAuthProvider } from '$lib/server/oauth';
import type { RequestEvent } from '@sveltejs/kit';
import type { OAuth2Tokens } from 'arctic';
import { ofetch } from 'ofetch';
import type { GithubUser } from '$lib/server/oauth.types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import {
	createSession,
	generateSessionToken,
	setSessionTokenCookie,
	type SessionFlags
} from '$lib/server/session';
import { createUser } from '$lib/server/user';

export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('github_oauth_state') ?? null;
	if (code === null || state === null || storedState === null) {
		return new Response(null, {
			status: 400
		});
	}
	if (state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await github.validateAuthorizationCode(code);
	} catch (e) {
		// Invalid code or client credentials
		console.warn('Invalid code or client credentials', { provider: OAuthProvider.GITHUB }, e);
		return new Response(null, {
			status: 400
		});
	}
	const githubUser = await ofetch<GithubUser>('https://api.github.com/user', {
		headers: {
			Authorization: `Bearer ${tokens.accessToken()}`
		}
	});
	let email = githubUser.email;
	if (!email) {
		const emails = await ofetch<
			{ email: string; primary: boolean; verified: boolean; visibility: 'public' | null }[]
		>('https://api.github.com/user/emails', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken()}`
			}
		});
		email =
			emails.find((e) => e.primary && e.verified)?.email ||
			emails.find((e) => e.verified)?.email ||
			emails[0].email;
	}
	const githubUserId = githubUser.id.toString();

	const [result] = await db
		.select({
			user: { id: table.user.id, email: table.user.email },
			oauthAccount: table.oAuthAccount
		})
		.from(table.oAuthAccount)
		.innerJoin(table.user, eq(table.oAuthAccount.userId, table.user.id))
		.where(
			and(
				eq(table.oAuthAccount.provider, OAuthProvider.GITHUB),
				eq(table.oAuthAccount.providerUserId, githubUserId)
			)
		);

	const existingUser = result?.user;

	if (existingUser) {
		const sessionToken = generateSessionToken();
		const sessionFlags: SessionFlags = {
			twoFactorVerified: false
		};
		const session = await createSession(sessionToken, existingUser.id, sessionFlags);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		});
	}

	const user = await createUser({
		email,
		name: githubUser.name
	});

	// create a new OAuth account record
	await db.insert(table.oAuthAccount).values({
		userId: user.id,
		provider: OAuthProvider.GITHUB,
		providerUserId: githubUserId
	});

	const sessionToken = generateSessionToken();
	const sessionFlags: SessionFlags = {
		twoFactorVerified: false
	};
	const session = await createSession(sessionToken, user.id, sessionFlags);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);

	return new Response(null, {
		status: 302,
		headers: {
			Location: '/'
		}
	});
}
