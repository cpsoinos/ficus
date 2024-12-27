/**
 * Base32 encoding utility (RFC 4648 without padding, uppercase)
 */
function base32EncodeNoPadding(bytes: Uint8Array): string {
	const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
	let bits = 0;
	let value = 0;
	let output = '';

	for (let i = 0; i < bytes.length; i++) {
		value = (value << 8) | bytes[i];
		bits += 8;

		while (bits >= 5) {
			output += alphabet[(value >>> (bits - 5)) & 31];
			bits -= 5;
		}
	}

	if (bits > 0) {
		output += alphabet[(value << (5 - bits)) & 31];
	}

	return output;
}

/**
 * Generate a 5-byte random OTP encoded in Base32
 */
export function generateRandomOTP(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(5));
	return base32EncodeNoPadding(bytes);
}

/**
 * Generate a 10-byte random recovery code encoded in Base32
 */
export function generateRandomRecoveryCode(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(10));
	return base32EncodeNoPadding(bytes);
}
