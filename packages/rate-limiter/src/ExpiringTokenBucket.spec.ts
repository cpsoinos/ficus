import { env, runInDurableObject } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import { ExpiringTokenBucket, type ExpiringBucket } from './ExpiringTokenBucket';

describe('ExpiringTokenBucket', () => {
	describe('setParams', () => {
		it('should set parameters correctly', async () => {
			const id = env.EXPIRING_TOKEN_BUCKET.idFromName('/path');
			const stub = env.EXPIRING_TOKEN_BUCKET.get(id);

			await runInDurableObject(stub, async (instance) => {
				await instance.setParams({ max: 10, expiresInSeconds: 60 });
				const max = await instance.storage.get<number>('max');
				const expiresInSeconds = await instance.storage.get<number>('expiresInSeconds');
				expect(max).toBe(10);
				expect(expiresInSeconds).toBe(60);
			});
		});
	});

	describe('check', () => {
		it('should return true when checking token availability if bucket has not yet been used', async () => {
			const id = env.EXPIRING_TOKEN_BUCKET.idFromName('/path');
			const stub = env.EXPIRING_TOKEN_BUCKET.get(id);

			const response = await runInDurableObject(stub, async (instance) => {
				expect(instance).toBeInstanceOf(ExpiringTokenBucket); // Exact same class as import
				await instance.setParams({ max: 10, expiresInSeconds: 60 });
				return instance.check('test-key', 1);
			});

			expect(response).toBe(true);
		});

		it('should return true when checking token availability if bucket has enough tokens', async () => {
			const id = env.EXPIRING_TOKEN_BUCKET.idFromName('/path');
			const stub = env.EXPIRING_TOKEN_BUCKET.get(id);

			const response = await runInDurableObject(stub, async (instance) => {
				await instance.setParams({ max: 10, expiresInSeconds: 60 });
				await instance.storage.put('test-key', {
					count: 10,
					createdAt: Date.now()
				});
				return instance.check('test-key', 1);
			});

			expect(response).toBe(true);
		});

		it('should return false when checking token availability if bucket does not have enough tokens', async () => {
			const id = env.EXPIRING_TOKEN_BUCKET.idFromName('/path');
			const stub = env.EXPIRING_TOKEN_BUCKET.get(id);

			const response = await runInDurableObject(stub, async (instance) => {
				await instance.setParams({ max: 10, expiresInSeconds: 60 });
				await instance.storage.put('test-key', {
					count: 0,
					createdAt: Date.now()
				});
				return instance.check('test-key', 1);
			});

			expect(response).toBe(false);
		});

		it('should return true when bucket has expired', async () => {
			const id = env.EXPIRING_TOKEN_BUCKET.idFromName('/path');
			const stub = env.EXPIRING_TOKEN_BUCKET.get(id);

			const response = await runInDurableObject(stub, async (instance) => {
				await instance.setParams({ max: 10, expiresInSeconds: 1 });
				await instance.storage.put('test-key', {
					count: 0,
					createdAt: Date.now() - 2000
				});
				return instance.check('test-key', 1);
			});

			expect(response).toBe(true);
		});
	});

	describe('consume', () => {
		it('should consume tokens correctly when bucket is empty', async () => {
			const id = env.EXPIRING_TOKEN_BUCKET.idFromName('/path');
			const stub = env.EXPIRING_TOKEN_BUCKET.get(id);

			const response = await runInDurableObject(stub, async (instance) => {
				await instance.setParams({ max: 10, expiresInSeconds: 60 });
				return instance.consume('test-key', 1);
			});

			expect(response).toBe(true);

			await runInDurableObject(stub, async (instance) => {
				const bucket = await instance.storage.get<ExpiringBucket>('test-key');
				expect(bucket!.count).toBe(9);
			});
		});

		it('should consume tokens correctly when bucket has enough tokens', async () => {
			const id = env.EXPIRING_TOKEN_BUCKET.idFromName('/path');
			const stub = env.EXPIRING_TOKEN_BUCKET.get(id);

			const response = await runInDurableObject(stub, async (instance) => {
				await instance.setParams({ max: 10, expiresInSeconds: 60 });
				await instance.storage.put('test-key', {
					count: 10,
					createdAt: Date.now()
				});
				return instance.consume('test-key', 1);
			});

			expect(response).toBe(true);

			await runInDurableObject(stub, async (instance) => {
				const bucket = await instance.storage.get<ExpiringBucket>('test-key');
				expect(bucket!.count).toBe(9);
			});
		});

		it('should not consume tokens if bucket does not have enough tokens', async () => {
			const id = env.EXPIRING_TOKEN_BUCKET.idFromName('/path');
			const stub = env.EXPIRING_TOKEN_BUCKET.get(id);

			const response = await runInDurableObject(stub, async (instance) => {
				await instance.setParams({ max: 10, expiresInSeconds: 60 });
				await instance.storage.put('test-key', {
					count: 0,
					createdAt: Date.now()
				});
				return instance.consume('test-key', 1);
			});

			expect(response).toBe(false);

			await runInDurableObject(stub, async (instance) => {
				const bucket = await instance.storage.get<ExpiringBucket>('test-key');
				expect(bucket!.count).toBe(0);
			});
		});
	});

	describe('reset', () => {
		it('should reset the bucket correctly', async () => {
			const id = env.EXPIRING_TOKEN_BUCKET.idFromName('/path');
			const stub = env.EXPIRING_TOKEN_BUCKET.get(id);

			await runInDurableObject(stub, async (instance) => {
				await instance.setParams({ max: 10, expiresInSeconds: 60 });
				await instance.storage.put('test-key', {
					count: 10,
					createdAt: Date.now()
				});
				await instance.reset('test-key');
				const bucket = await instance.storage.get<ExpiringBucket>('test-key');
				expect(bucket).toBeUndefined();
			});
		});
	});
});
