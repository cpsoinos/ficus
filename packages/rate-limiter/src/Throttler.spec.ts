import { Throttler } from './Throttler';
import { env, runInDurableObject } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';

describe('Throttler', () => {
	it('should set parameters correctly', async () => {
		const id = env.THROTTLER.idFromName('/path');
		const stub = env.THROTTLER.get(id);

		await runInDurableObject(stub, async (instance) => {
			await instance.setParams({ timeoutSeconds: [1, 2, 3] });
			const params = await instance.storage.get<number[]>('timeoutSeconds');
			expect(params).toEqual([1, 2, 3]);
		});
	});

	it('should allow consumption if timeout has passed', async () => {
		const id = env.THROTTLER.idFromName('/path');
		const stub = env.THROTTLER.get(id);

		const response = await runInDurableObject(stub, async (instance) => {
			expect(instance).toBeInstanceOf(Throttler); // Exact same class as import
			await instance.setParams({ timeoutSeconds: [1, 2, 3] });
			await instance.storage.put('counter', {
				timeout: 0,
				updatedAt: Date.now() - 2000
			});
			return instance.consume();
		});

		expect(response).toBe(true);
	});

	it('should disallow consumption if timeout has not passed', async () => {
		const id = env.THROTTLER.idFromName('/path');
		const stub = env.THROTTLER.get(id);

		const response = await runInDurableObject(stub, async (instance) => {
			await instance.setParams({ timeoutSeconds: [1, 2, 3] });
			await instance.storage.put('counter', {
				timeout: 0,
				updatedAt: Date.now()
			});
			return instance.consume();
		});

		expect(response).toBe(false);
	});

	it('should handle multiple consecutive consumes correctly', async () => {
		const id = env.THROTTLER.idFromName('/path');
		const stub = env.THROTTLER.get(id);

		const response = await runInDurableObject(stub, async (instance) => {
			await instance.setParams({ timeoutSeconds: [1, 2, 3] });
			await instance.storage.put('counter', {
				timeout: 0,
				updatedAt: Date.now() - 2000
			});
			const firstConsume = await instance.consume();
			const secondConsume = await instance.consume();
			return { firstConsume, secondConsume };
		});

		expect(response.firstConsume).toBe(true);
		expect(response.secondConsume).toBe(false);
	});

	it('should handle edge case of empty timeoutSeconds array', async () => {
		const id = env.THROTTLER.idFromName('/path');
		const stub = env.THROTTLER.get(id);

		await runInDurableObject(stub, async (instance) => {
			await instance.setParams({ timeoutSeconds: [] });
			const response = await instance.consume();
			expect(response).toBe(true);
		});
	});

	it('should reset the counter correctly', async () => {
		const id = env.THROTTLER.idFromName('/path');
		const stub = env.THROTTLER.get(id);

		await runInDurableObject(stub, async (instance) => {
			await instance.setParams({ timeoutSeconds: [1, 2, 3] });
			await instance.storage.put('counter', {
				timeout: 1,
				updatedAt: Date.now()
			});
			await instance.reset();
			const counter = await instance.storage.get('counter');
			expect(counter).toBeUndefined();
		});
	});
});
