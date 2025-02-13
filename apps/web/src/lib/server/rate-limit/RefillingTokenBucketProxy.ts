import type { RefillingTokenBucket } from '@ficus/rate-limiter/src';
import { Bindings } from '$lib/server/bindings';

export class RefillingTokenBucketProxy {
	stub: DurableObjectStub<RefillingTokenBucket>;

	private constructor(stub: DurableObjectStub<RefillingTokenBucket>) {
		this.stub = stub;
	}

	static async initialize({
		name,
		refillRate,
		capacity,
		updateMs
	}: {
		name: string;
		refillRate: number;
		capacity: number;
		updateMs: number;
	}): Promise<RefillingTokenBucketProxy> {
		const id = Bindings.REFILLING_TOKEN_BUCKET.idFromName(name);
		const stub = Bindings.REFILLING_TOKEN_BUCKET.get(id);
		await stub.fetch('https://ficus-rate-limiter.local/set-params', {
			method: 'POST',
			body: JSON.stringify({ refillRate, capacity, updateMs })
		});
		return new RefillingTokenBucketProxy(stub);
	}

	async check(cost = 1): Promise<boolean> {
		const resp = await this.stub.fetch('https://ficus-rate-limiter.local/check', {
			method: 'POST',
			body: JSON.stringify({ tokens: cost })
		});
		return await resp.json();
	}

	async consume(cost = 1): Promise<{
		allowed: boolean;
		remainingTokens: number;
		nextRefillTime?: number;
	}> {
		const resp = await this.stub.fetch('https://ficus-rate-limiter.local/consume', {
			method: 'POST',
			body: JSON.stringify({ tokens: cost })
		});
		return await resp.json();
	}
}
