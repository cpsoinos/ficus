import { and, eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { usersTable, type NewUser, type User } from '$lib/server/db/schema';

import { decrypt, decryptToString, encrypt, encryptString } from './encryption';
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

	const [createdUser] = await db.insert(usersTable).values(newUser).returning();

	return createdUser;
}

export async function updateUserPassword(userId: string, password: string): Promise<void> {
	const passwordHash = await hashPassword(password);
	await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, userId));
}

export async function updateUserEmailAndSetEmailAsVerified(
	userId: string,
	email: string
): Promise<void> {
	await db.update(usersTable).set({ email, emailVerified: true }).where(eq(usersTable.id, userId));
}

export async function setUserAsEmailVerifiedIfEmailMatches(
	userId: string,
	email: string
): Promise<boolean> {
	const result = await db
		.update(usersTable)
		.set({ emailVerified: true })
		.where(and(eq(usersTable.id, userId), eq(usersTable.email, email)));
	return result.success;
}

export async function getUserPasswordHash(userId: string): Promise<string | null> {
	const row = await db.query.usersTable.findFirst({
		columns: {
			passwordHash: true
		},
		where: eq(usersTable.id, userId)
	});
	if (!row) {
		throw new Error('Invalid user ID');
	}
	return row.passwordHash;
}

export async function getUserRecoverCode(userId: string): Promise<string> {
	const row = await db.query.usersTable.findFirst({
		columns: {
			recoveryCode: true
		},
		where: eq(usersTable.id, userId)
	});
	if (!row) {
		throw new Error('Invalid user ID');
	}
	return decryptToString(row.recoveryCode);
}

export async function getUserTOTPKey(userId: string): Promise<Uint8Array | null> {
	const row = await db.query.usersTable.findFirst({
		columns: {
			totpKey: true
		},
		where: eq(usersTable.id, userId)
	});
	if (!row) {
		throw new Error('Invalid user ID');
	}
	const encrypted = row.totpKey;
	if (!encrypted) {
		return null;
	}
	return decrypt(encrypted);
}

export async function updateUserTOTPKey(userId: string, key: Uint8Array): Promise<void> {
	const encrypted = await encrypt(key);
	await db.update(usersTable).set({ totpKey: encrypted }).where(eq(usersTable.id, userId));
}

export async function resetUserRecoveryCode(userId: string): Promise<string> {
	const recoveryCode = generateRandomRecoveryCode();
	const encrypted = await encryptString(recoveryCode);
	await db.update(usersTable).set({ recoveryCode: encrypted }).where(eq(usersTable.id, userId));
	return recoveryCode;
}

export async function getUserFromEmail(email: string): Promise<User | null> {
	const row = await db.query.usersTable.findFirst({
		where: eq(usersTable.email, email)
	});
	return row || null;
}
