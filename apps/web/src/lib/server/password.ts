import { Bindings } from './bindings';

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
