import type { RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import type { NewSession, Session } from '$lib/server/db/schema';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = 'auth-session';

export function generateSessionToken(): string {
	const tokenBytes = new Uint8Array(20);
	crypto.getRandomValues(tokenBytes);
	const token = encodeBase32LowerCaseNoPadding(tokenBytes).toLowerCase();
	return token;
}

export async function encodeSessionToken(token: string): Promise<string> {
	return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

export async function createSession(
	token: string,
	userId: string,
	flags: SessionFlags
): Promise<Session> {
	const sessionId = await encodeSessionToken(token);
	const sessionToInsert: NewSession = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + DAY_IN_MS * 30),
		twoFactorVerified: flags.twoFactorVerified
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

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(table.session).where(eq(table.session.id, sessionId));
}

export async function invalidateUserSessions(userId: string): Promise<void> {
	await db.delete(table.session).where(eq(table.session.userId, userId));
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

export async function setSessionAs2FAVerified(sessionId: string): Promise<boolean> {
	const result = await db
		.update(table.session)
		.set({ twoFactorVerified: true })
		.where(eq(table.session.id, sessionId));
	return result.success;
}

export interface SessionFlags {
	twoFactorVerified: boolean;
}
