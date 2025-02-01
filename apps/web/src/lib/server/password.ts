import { Bindings } from './bindings';
import { sha1 } from '@oslojs/crypto/sha1';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { ExpiringTokenBucketProxy } from './rate-limit/ExpiringTokenBucketProxy';

export const getPasswordUpdateBucket = async (userId: string) => {
	return ExpiringTokenBucketProxy.initialize({
		name: `${userId}:passwordUpdate`,
		max: 5,
		expiresInSeconds: 60 * 30
	});
};

export async function hashPassword(password: string): Promise<string> {
	const hashResp = await Bindings.env.ARGON2.fetch('http://internal/hash', {
		method: 'POST',
		body: JSON.stringify({ password })
	});
	const resp = await hashResp.json<{ hash: string }>();
	const passwordHash = resp.hash;
	return passwordHash;
}

export async function verifyPassword(storedHash: string, password: string): Promise<boolean> {
	const hashResp = await Bindings.env.ARGON2.fetch('http://internal/verify', {
		method: 'POST',
		body: JSON.stringify({ hash: storedHash, password })
	});
	const resp = await hashResp.json<{ matches: boolean }>();
	return resp.matches;
}

export async function verifyPasswordStrength(password: string): Promise<boolean> {
	if (password.length < 8 || password.length > 255) return false;

	const hash = encodeHexLowerCase(sha1(new TextEncoder().encode(password)));
	const hashPrefix = hash.slice(0, 5);
	const response = await fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`);
	const dataText = await response.text();
	const items = dataText.split('\n');
	for (const item of items) {
		const hashSuffix = item.slice(0, 35).toLowerCase();
		if (hash === hashPrefix + hashSuffix) return false;
	}
	return true;
}
