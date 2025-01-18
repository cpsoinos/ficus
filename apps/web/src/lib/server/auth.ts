import type { RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = 'auth-session';

export function generateSessionToken(): string {
	// Generate 18 random bytes
	const bytes = crypto.getRandomValues(new Uint8Array(18));

	// Convert bytes to a Base64 URL-safe string
	const token = btoa(String.fromCharCode(...bytes))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');

	return token;
}

export async function encodeSessionToken(token: string): Promise<string> {
	// Hash the token using SHA-256
	const encoder = new TextEncoder();
	const data = encoder.encode(token);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);

	// Convert the hash to a lowercase hex string
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hexString = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');

	return hexString;
}

export async function createSession(token: string, userId: string) {
	const sessionId = await encodeSessionToken(token);
	const sessionToInsert: table.NewSession = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
	};
	const [session] = await db.insert(table.session).values(sessionToInsert).returning();
	return session;
}

export async function validateSessionToken(token: string) {
	const sessionId = await encodeSessionToken(token);
	const [result] = await db
		.select({
			// Adjust user table here to tweak returned data
			user: table.user,
			session: table.session
		})
		.from(table.session)
		.innerJoin(table.user, eq(table.session.userId, table.user.id))
		.where(eq(table.session.id, sessionId));

	if (!result) {
		return { session: null, user: null };
	}
	const { session, user } = result;

	const sessionExpired = Date.now() >= session.expiresAt.getTime();
	if (sessionExpired) {
		await db.delete(table.session).where(eq(table.session.id, session.id));
		return { session: null, user: null };
	}

	const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
	if (renewSession) {
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
		await db
			.update(table.session)
			.set({ expiresAt: session.expiresAt })
			.where(eq(table.session.id, session.id));
	}

	return { session, user };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(sessionId: string) {
	await db.delete(table.session).where(eq(table.session.id, sessionId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/'
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: '/'
	});
}
