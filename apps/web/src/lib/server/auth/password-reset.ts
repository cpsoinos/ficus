import { db } from '$lib/server/db';
import { generateRandomOTP } from './utils';
import type { RequestEvent } from '@sveltejs/kit';
import {
	passwordResetSession,
	type NewPasswordResetSession,
	type PasswordResetSession,
	type User
} from '$lib/server/db/schema';
import { encodeSessionToken } from './session';
import { eq } from 'drizzle-orm';
import { RefillingTokenBucketProxy } from '$lib/server/rate-limit/RefillingTokenBucketProxy';
import { ExpiringTokenBucketProxy } from '$lib/server/rate-limit/ExpiringTokenBucketProxy';

const REFILL_RATE = 3;
const CAPACITY = 3;
const UPDATE_MS = 1000;

export async function getIpBucket(clientIP: string) {
	const ipBucket = await RefillingTokenBucketProxy.initialize({
		name: `${clientIP}:forgot-password`,
		refillRate: REFILL_RATE,
		capacity: CAPACITY,
		updateMs: UPDATE_MS
	});
	return ipBucket;
}

export async function getUserBucket(userId: string) {
	const ipBucket = await RefillingTokenBucketProxy.initialize({
		name: `${userId}:forgot-password`,
		refillRate: REFILL_RATE,
		capacity: CAPACITY,
		updateMs: UPDATE_MS
	});
	return ipBucket;
}

export async function getVerifyEmailBucket(userId: string) {
	const verifyEmailBucket = await ExpiringTokenBucketProxy.initialize({
		name: `${userId}:forgot-password`,
		max: 5,
		expiresInSeconds: 60 * 30
	});
	return verifyEmailBucket;
}

export async function createPasswordResetSession(
	token: string,
	userId: string,
	email: string
): Promise<PasswordResetSession> {
	const sessionId = encodeSessionToken(token);
	const sessionToInsert: NewPasswordResetSession = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 10),
		code: generateRandomOTP(),
		email,
		emailVerified: false,
		twoFactorVerified: false
	};

	const [session] = await db.insert(passwordResetSession).values(sessionToInsert).returning();

	return session;
}

export async function validatePasswordResetSessionToken(
	token: string
): Promise<PasswordResetSessionValidationResult> {
	const sessionId = encodeSessionToken(token);
	const result = await db.query.passwordResetSession.findFirst({
		with: {
			user: {
				// exclude these columns due to drizzle orm bug related to blobs and json
				columns: {
					id: true,
					email: true,
					emailVerified: true,
					registered2FA: true
					// totpKey: false,
					// recoveryCode: false
				}
			}
		},
		where: eq(passwordResetSession.id, sessionId)
	});
	if (!result?.user) {
		return { session: null, user: null };
	}
	const { user, ...session } = result;

	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(passwordResetSession).where(eq(passwordResetSession.id, session.id));
		return { session: null, user: null };
	}
	return { session, user };
}

export async function setPasswordResetSessionAsEmailVerified(sessionId: string): Promise<void> {
	await db
		.update(passwordResetSession)
		.set({ emailVerified: true })
		.where(eq(passwordResetSession.id, sessionId));
}

export async function setPasswordResetSessionAs2FAVerified(sessionId: string): Promise<void> {
	await db
		.update(passwordResetSession)
		.set({ twoFactorVerified: true })
		.where(eq(passwordResetSession.id, sessionId));
}

export async function invalidateUserPasswordResetSessions(userId: string): Promise<void> {
	await db.delete(passwordResetSession).where(eq(passwordResetSession.userId, userId));
}

export async function validatePasswordResetSessionRequest(
	event: RequestEvent
): Promise<PasswordResetSessionValidationResult> {
	const token = event.cookies.get('password_reset_session') ?? null;
	if (token === null) {
		return { session: null, user: null };
	}
	const result = await validatePasswordResetSessionToken(token);
	if (result.session === null) {
		deletePasswordResetSessionTokenCookie(event);
	}
	return result;
}

export function setPasswordResetSessionTokenCookie(
	event: RequestEvent,
	token: string,
	expiresAt: Date
): void {
	event.cookies.set('password_reset_session', token, {
		expires: expiresAt,
		sameSite: 'lax',
		httpOnly: true,
		path: '/',
		secure: !import.meta.env.DEV
	});
}

export function deletePasswordResetSessionTokenCookie(event: RequestEvent): void {
	event.cookies.set('password_reset_session', '', {
		maxAge: 0,
		sameSite: 'lax',
		httpOnly: true,
		path: '/',
		secure: !import.meta.env.DEV
	});
}

export async function sendPasswordResetEmail(email: string, code: string): Promise<void> {
	console.log(`To ${email}: Your reset code is ${code}`);
}

export type PasswordResetSessionValidationResult =
	| {
			session: PasswordResetSession;
			user: Pick<User, 'id' | 'email' | 'emailVerified' | 'registered2FA'>;
	  }
	| { session: null; user: null };
