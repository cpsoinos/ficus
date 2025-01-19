import { db } from '$lib/server/db';
import { user, type NewUser, type User } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { decryptToString, encrypt, encryptString } from './encryption';
import { hashPassword } from './password';
import { generateRandomRecoveryCode } from './utils';

export function verifyUsernameInput(username: string): boolean {
	return username.length > 3 && username.length < 32 && username.trim() === username;
}

export async function createUser({
	email,
	password,
	name
}: {
	email: string;
	password?: string;
	name?: string | null;
}): Promise<User> {
	const recoveryCode = generateRandomRecoveryCode();
	const encryptedRecoveryCode = await encryptString(recoveryCode);
	const passwordHash = password ? await hashPassword(password) : undefined;

	const newUser: NewUser = {
		email,
		name,
		passwordHash,
		recoveryCode: encryptedRecoveryCode
	};

	const [createdUser] = await db.insert(user).values(newUser).returning();

	return createdUser;
}

export async function updateUserPassword(userId: string, password: string): Promise<void> {
	const passwordHash = await hashPassword(password);
	await db.update(user).set({ passwordHash }).where(eq(user.id, userId));
}

export async function updateUserEmailAndSetEmailAsVerified(
	userId: string,
	email: string
): Promise<void> {
	await db.update(user).set({ email, emailVerified: true }).where(eq(user.id, userId));
}

export async function setUserAsEmailVerifiedIfEmailMatches(
	userId: string,
	email: string
): Promise<boolean> {
	const result = await db
		.update(user)
		.set({ emailVerified: true })
		.where(and(eq(user.id, userId), eq(user.email, email)));
	return result.success;
}

export async function getUserPasswordHash(userId: string): Promise<string | null> {
	const row = await db.query.user.findFirst({
		columns: {
			passwordHash: true
		},
		where: eq(user.id, userId)
	});
	if (!row) {
		throw new Error('Invalid user ID');
	}
	return row.passwordHash;
}

export async function getUserRecoverCode(userId: string): Promise<string> {
	const row = await db.query.user.findFirst({
		columns: {
			recoveryCode: true
		},
		where: eq(user.id, userId)
	});
	if (!row) {
		throw new Error('Invalid user ID');
	}
	return decryptToString(row.recoveryCode);
}

export async function getUserTOTPKey(userId: string): Promise<Uint8Array | null> {
	const row = await db.query.user.findFirst({
		columns: {
			totpKey: true
		},
		where: eq(user.id, userId)
	});
	if (!row) {
		throw new Error('Invalid user ID');
	}
	return row.totpKey;
}

export async function updateUserTOTPKey(userId: string, key: Uint8Array): Promise<void> {
	const encrypted = await encrypt(key);
	await db.update(user).set({ totpKey: encrypted }).where(eq(user.id, userId));
}

export async function resetUserRecoveryCode(userId: string): Promise<string> {
	const recoveryCode = generateRandomRecoveryCode();
	const encrypted = await encryptString(recoveryCode);
	await db.update(user).set({ recoveryCode: encrypted }).where(eq(user.id, userId));
	return recoveryCode;
}

export async function getUserFromEmail(email: string): Promise<User | null> {
	const row = await db.query.user.findFirst({
		where: eq(user.email, email)
	});
	return row || null;
}
