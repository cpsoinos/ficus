import { db } from './db';
import { decryptToString, encryptString } from './encryption';
import { generateRandomRecoveryCode } from './utils';
import { user, session } from './db/schema';
import { and, eq } from 'drizzle-orm';
import { ExpiringTokenBucketProxy } from './rate-limit/ExpiringTokenBucketProxy';
import { RefillingTokenBucketProxy } from './rate-limit/RefillingTokenBucketProxy';

export const getTotpBucket = async (userId: string) => {
	return await ExpiringTokenBucketProxy.initialize({
		name: `${userId}:totp`,
		max: 5,
		expiresInSeconds: 60 * 30
	});
};

export const getTotpUpdateBucket = async (userId: string) => {
	return await RefillingTokenBucketProxy.initialize({
		name: `${userId}:2fa-update`,
		refillRate: 1,
		capacity: 3,
		updateMs: 60 * 10 * 1000
	});
};

export const getRecoveryCodeBucket = async (userId: string) => {
	return await ExpiringTokenBucketProxy.initialize({
		name: `${userId}:recoveryCode`,
		max: 3,
		expiresInSeconds: 60 * 60
	});
};

export async function resetUser2FAWithRecoveryCode(
	userId: string,
	recoveryCode: string
): Promise<boolean> {
	const row = await db.query.user.findFirst({
		columns: {
			recoveryCode: true
		},
		where: eq(user.id, userId)
	});
	if (!row) {
		return false;
	}
	const encryptedRecoveryCode = row.recoveryCode;
	const userRecoveryCode = await decryptToString(encryptedRecoveryCode);
	if (recoveryCode !== userRecoveryCode) {
		return false;
	}

	const newRecoveryCode = generateRandomRecoveryCode();
	const encryptedNewRecoveryCode = await encryptString(newRecoveryCode);

	await db.update(session).set({ twoFactorVerified: false }).where(eq(session.userId, userId));
	const result = await db
		.update(user)
		.set({ recoveryCode: encryptedNewRecoveryCode, totpKey: null })
		.where(and(eq(user.id, userId), eq(user.recoveryCode, encryptedRecoveryCode)))
		.returning();

	return result.length > 0;
}
