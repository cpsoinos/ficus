import { generateRandomOTP } from './utils';
import { db } from '$lib/server/db';
import type { RequestEvent } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { emailVerificationRequest, type EmailVerificationRequest } from '$lib/server/db/schema';
import { ExpiringTokenBucketProxy } from '$lib/server/rate-limit/ExpiringTokenBucketProxy';

const EMAIL_VERIFICATION_COOKIE_NAME = 'email_verification';

export const getEmailVerificationBucket = async (userId: string) => {
	return await ExpiringTokenBucketProxy.initialize({
		name: userId,
		max: 5,
		expiresInSeconds: 60 * 30
	});
};

export async function getUserEmailVerificationRequest(
	userId: string,
	id: string
): Promise<EmailVerificationRequest | null> {
	const existingEmailVerificationRequest = await db.query.emailVerificationRequest.findFirst({
		where: (table) => and(eq(table.id, id), eq(table.userId, userId))
	});
	return existingEmailVerificationRequest || null;
}

export async function createEmailVerificationRequest(
	userId: string,
	email: string
): Promise<EmailVerificationRequest> {
	await deleteUserEmailVerificationRequest(userId);

	const code = generateRandomOTP();
	const expiresAt = new Date(Date.now() + 1000 * 60 * 10);

	const [request] = await db
		.insert(emailVerificationRequest)
		.values({
			userId,
			email,
			code,
			expiresAt
		})
		.returning();

	return request;
}

export async function deleteUserEmailVerificationRequest(userId: string): Promise<void> {
	await db.delete(emailVerificationRequest).where(eq(emailVerificationRequest.userId, userId));
}

export async function sendVerificationEmail(email: string, code: string): Promise<void> {
	Promise.resolve(console.log(`To ${email}: Your verification code is ${code}`));
}

export function setEmailVerificationRequestCookie(
	event: RequestEvent,
	request: EmailVerificationRequest
): void {
	event.cookies.set(EMAIL_VERIFICATION_COOKIE_NAME, request.id, {
		httpOnly: true,
		path: '/',
		secure: import.meta.env.PROD,
		sameSite: 'lax',
		expires: request.expiresAt
	});
}

export function deleteEmailVerificationRequestCookie(event: RequestEvent): void {
	event.cookies.set(EMAIL_VERIFICATION_COOKIE_NAME, '', {
		httpOnly: true,
		path: '/',
		secure: import.meta.env.PROD,
		sameSite: 'lax',
		maxAge: 0
	});
}

export async function getUserEmailVerificationRequestFromRequest(
	event: RequestEvent
): Promise<EmailVerificationRequest | null> {
	if (event.locals.user === null) {
		return null;
	}
	const id = event.cookies.get(EMAIL_VERIFICATION_COOKIE_NAME) ?? null;
	if (id === null) {
		return null;
	}
	const request = await getUserEmailVerificationRequest(event.locals.user.id, id);
	if (request === null) {
		deleteEmailVerificationRequestCookie(event);
	}
	return request;
}

// export const sendVerificationEmailBucket = new ExpiringTokenBucket<number>(3, 60 * 10);
