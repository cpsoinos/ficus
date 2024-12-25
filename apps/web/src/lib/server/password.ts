import { Bindings } from './bindings';

// export const HASHING_METHOD = 'PBKDF2';
// export const HASH_ALGORITHM = 'SHA-256';

export async function hashPassword(password: string): Promise<string> {
	// const iterations = 100000;
	// const salt = crypto.getRandomValues(new Uint8Array(16)); // Generate random 16-byte salt
	// const encoder = new TextEncoder();

	// const key = await crypto.subtle.importKey(
	// 	'raw',
	// 	encoder.encode(password),
	// 	{ name: HASHING_METHOD },
	// 	false,
	// 	['deriveBits']
	// );

	// const derivedKey = await crypto.subtle.deriveBits(
	// 	{
	// 		name: HASHING_METHOD,
	// 		salt: salt,
	// 		iterations: iterations,
	// 		hash: HASH_ALGORITHM
	// 	},
	// 	key,
	// 	256 // Length in bits
	// );

	// // Encode the salt and derived key in a database-friendly format
	// const saltHex = Array.from(new Uint8Array(salt))
	// 	.map((b) => b.toString(16).padStart(2, '0'))
	// 	.join('');
	// const hashHex = Array.from(new Uint8Array(derivedKey))
	// 	.map((b) => b.toString(16).padStart(2, '0'))
	// 	.join('');

	// return `${HASHING_METHOD}-${HASH_ALGORITHM}:${iterations}:${saltHex}:${hashHex}`;
	const hashResp = await Bindings.env.ARGON2.fetch('http://internal/hash', {
		method: 'POST',
		body: JSON.stringify({ password })
	});
	const resp = await hashResp.json<{ hash: string }>();
	const passwordHash = resp.hash;
	return passwordHash;
}

export async function verifyPassword(storedHash: string, password: string): Promise<boolean> {
	// const [algorithm, iterationsStr, saltHex, hashHex] = storedHash.split(':');
	// if (algorithm !== `${HASHING_METHOD}-${HASH_ALGORITHM}`) {
	// 	throw new Error('Unsupported algorithm');
	// }

	// const iterations = parseInt(iterationsStr, 10);
	// const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)));
	// const encoder = new TextEncoder();

	// const key = await crypto.subtle.importKey(
	// 	'raw',
	// 	encoder.encode(password),
	// 	{ name: HASHING_METHOD },
	// 	false,
	// 	['deriveBits']
	// );

	// const derivedKey = await crypto.subtle.deriveBits(
	// 	{
	// 		name: HASHING_METHOD,
	// 		salt: salt,
	// 		iterations: iterations,
	// 		hash: HASH_ALGORITHM
	// 	},
	// 	key,
	// 	256
	// );

	// const derivedHex = Array.from(new Uint8Array(derivedKey))
	// 	.map((b) => b.toString(16).padStart(2, '0'))
	// 	.join('');
	// return derivedHex === hashHex;

	const hashResp = await Bindings.env.ARGON2.fetch('http://internal/verify', {
		method: 'POST',
		body: JSON.stringify({ hash: storedHash, password })
	});
	const resp = await hashResp.json<{ matches: boolean }>();
	return resp.matches;
}

export async function verifyPasswordStrength(password: string): Promise<boolean> {
	if (password.length < 8 || password.length > 255) return false;

	const encoder = new TextEncoder();
	const data = await crypto.subtle.digest('SHA-1', encoder.encode(password));
	const hash = Array.from(new Uint8Array(data))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
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
