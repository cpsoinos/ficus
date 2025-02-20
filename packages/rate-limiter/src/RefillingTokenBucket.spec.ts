import { RefillingTokenBucket } from './RefillingTokenBucket';
import { env, runDurableObjectAlarm, runInDurableObject } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';

describe('RefillingTokenBucket', () => {
	it('should throw an error if params are not set', async () => {
		const id = env.REFILLING_TOKEN_BUCKET.idFromName('/path');
		const stub = env.REFILLING_TOKEN_BUCKET.get(id);

		await runInDurableObject(stub, async (instance) => {
			await expect(instance.consume(1)).rejects.toThrow('Params not set!');
		});
	});

	it('should allow token consumption within capacity', async () => {
		const id = env.REFILLING_TOKEN_BUCKET.idFromName('/path');
		const stub = env.REFILLING_TOKEN_BUCKET.get(id);

		const response = await runInDurableObject(stub, async (instance) => {
			expect(instance).toBeInstanceOf(RefillingTokenBucket); // Exact same class as import
			await instance.setParams({
				refillRate: 2,
				capacity: 10,
				updateMs: 1000
			});
			return instance.consume(1);
		});

		expect(response).toEqual({ allowed: true, remainingTokens: 9 });
	});

	it('should disallow token consumption exceeding capacity', async () => {
		const id = env.REFILLING_TOKEN_BUCKET.idFromName('/path');
		const stub = env.REFILLING_TOKEN_BUCKET.get(id);

		const response = await runInDurableObject(stub, async (instance) => {
			await instance.setParams({
				refillRate: 2,
				capacity: 10,
				updateMs: 1000
			});
			return instance.consume(11);
		});

		expect(response.allowed).toBe(false);
		expect(response.remainingTokens).toBe(10);
	});

	describe('refillTokens', () => {
		it('should not refill tokens more frequently than the refill rate', async () => {
			const id = env.REFILLING_TOKEN_BUCKET.idFromName('/path');
			const stub = env.REFILLING_TOKEN_BUCKET.get(id);

			await runInDurableObject(stub, async (instance) => {
				await instance.setParams({
					refillRate: 2,
					capacity: 10,
					updateMs: 1000
				});
				instance.consume(10);
			});

			await runInDurableObject(stub, async (instance) => {
				return instance.storage.setAlarm(Date.now() + 1000);
			});

			// Immediately execute the alarm to reset the counter
			const ran = await runDurableObjectAlarm(stub);
			expect(ran).toBe(true); // ...as there was an alarm scheduled

			const remainingTokens = await runInDurableObject(stub, async (instance) => {
				return instance.storage.get<number>('remainingTokens');
			});

			expect(remainingTokens).toBe(0);
		});

		it('should refill tokens on alarm based on elapsed time', async () => {
			const id = env.REFILLING_TOKEN_BUCKET.idFromName('/path');
			const stub = env.REFILLING_TOKEN_BUCKET.get(id);

			await runInDurableObject(stub, async (instance) => {
				await instance.setParams({
					refillRate: 2,
					capacity: 10,
					updateMs: 1000
				});
				await instance.consume(10);
				await instance.storage.put('lastRefillTime', Date.now() - 3000);
				await instance.storage.setAlarm(Date.now() + 1000);
			});

			const ran = await runDurableObjectAlarm(stub);
			expect(ran).toBe(true);

			const remainingTokens = await runInDurableObject(stub, async (instance) => {
				return instance.storage.get<number>('remainingTokens');
			});

			expect(remainingTokens).toBe(6);
		});
	});
});
