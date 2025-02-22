import { github, OAuthProvider } from '$lib/server/auth/oauth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import {
	createSession,
	generateSessionToken,
	setSessionTokenCookie,
	type SessionFlags
} from '$lib/server/auth/session';
import { createUser } from '$lib/server/auth/user';
import { ofetch } from 'ofetch';
import { and, eq } from 'drizzle-orm';
import type { GithubUser } from '$lib/server/auth/oauth.types';
import type { OAuth2Tokens } from 'arctic';
import type { RequestEvent } from '@sveltejs/kit';

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

	const githubApiHeaders = {
		Authorization: `Bearer ${tokens.accessToken()}`,
		'User-Agent': 'ficus-web'
	};

	const githubUser = await ofetch<GithubUser>('https://api.github.com/user', {
		headers: githubApiHeaders
	});

	let email = githubUser.email;

	if (!email) {
		const emails = await ofetch<
			{ email: string; primary: boolean; verified: boolean; visibility: 'public' | null }[]
		>('https://api.github.com/user/emails', {
			headers: githubApiHeaders
		});
		email =
			emails.find((e) => e.primary && e.verified)?.email ||
			emails.find((e) => e.verified)?.email ||
			emails[0].email;
	}

	const githubUserId = githubUser.id.toString();

	const [result] = await db
		.select({
			user: { id: table.usersTable.id, email: table.usersTable.email },
			oauthAccount: table.oAuthAccountsTable
		})
		.from(table.oAuthAccountsTable)
		.innerJoin(table.usersTable, eq(table.oAuthAccountsTable.userId, table.usersTable.id))
		.where(
			and(
				eq(table.oAuthAccountsTable.provider, OAuthProvider.GITHUB),
				eq(table.oAuthAccountsTable.providerUserId, githubUserId)
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
	await db.insert(table.oAuthAccountsTable).values({
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
