import { Bindings } from '$lib/server/bindings';

import type { ExpiringTokenBucket } from '@ficus/rate-limiter/src';

export class ExpiringTokenBucketProxy {
	stub: DurableObjectStub<ExpiringTokenBucket>;

	private constructor(stub: DurableObjectStub<ExpiringTokenBucket>) {
		this.stub = stub;
	}

	static async initialize({
		name,
		max,
		expiresInSeconds
	}: {
		name: string;
		max: number;
		expiresInSeconds: number;
	}): Promise<ExpiringTokenBucketProxy> {
		const id = Bindings.EXPIRING_TOKEN_BUCKET.idFromName(name);
		const stub = Bindings.EXPIRING_TOKEN_BUCKET.get(id);
		await stub.fetch('https://ficus-rate-limiter.local/set-params', {
			method: 'POST',
			body: JSON.stringify({ max, expiresInSeconds })
		});
		return new ExpiringTokenBucketProxy(stub);
	}

	async check(key: string, cost = 1): Promise<boolean> {
		const resp = await this.stub.fetch('https://ficus-rate-limiter.local/check', {
			method: 'POST',
			body: JSON.stringify({ key, cost })
		});
		return await resp.json();
	}

	async consume(key: string, cost = 1): Promise<boolean> {
		const resp = await this.stub.fetch('https://ficus-rate-limiter.local/consume', {
			method: 'POST',
			body: JSON.stringify({ key, cost })
		});
		return await resp.json();
	}

	async reset(key: string): Promise<void> {
		await this.stub.fetch('https://ficus-rate-limiter.local/reset', {
			method: 'POST',
			body: JSON.stringify({ key })
		});
	}
}
