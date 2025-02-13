import { ENCRYPTION_KEY } from '$env/static/private';
import { decodeBase64 } from '@oslojs/encoding';
import { Buffer } from 'node:buffer';

const key = decodeBase64(ENCRYPTION_KEY);

async function importKey(rawKey: Uint8Array): Promise<CryptoKey> {
	return crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export async function encrypt(data: Uint8Array): Promise<Uint8Array> {
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const cryptoKey = await importKey(key);
	const encrypted = await crypto.subtle.encrypt(
		{
			name: 'AES-GCM',
			iv: iv
		},
		cryptoKey,
		data
	);
	const result = new Uint8Array(iv.length + encrypted.byteLength);
	result.set(iv);
	result.set(new Uint8Array(encrypted), iv.length);
	return result;
}

export async function encryptString(data: string): Promise<Uint8Array> {
	return encrypt(new TextEncoder().encode(data));
}

export async function decrypt(encrypted: Uint8Array): Promise<Uint8Array> {
	if (encrypted.byteLength < 13) {
		throw new Error('Invalid data');
	}
	const iv = encrypted.slice(0, 12);
	const cryptoKey = await importKey(key);
	const decrypted = await crypto.subtle.decrypt(
		{
			name: 'AES-GCM',
			iv: Buffer.from(iv)
		},
		cryptoKey,
		Buffer.from(encrypted.slice(12))
	);
	return new Uint8Array(decrypted);
}

export async function decryptToString(data: Uint8Array): Promise<string> {
	const decrypted = await decrypt(data);
	return new TextDecoder().decode(decrypted);
}
