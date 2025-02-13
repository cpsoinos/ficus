import type { Throttler } from '@ficus/rate-limiter/src';
import { Bindings } from '$lib/server/bindings';

export class ThrottlerProxy {
	stub: DurableObjectStub<Throttler>;

	private constructor(stub: DurableObjectStub<Throttler>) {
		this.stub = stub;
	}

	static async initialize({
		name,
		timeoutSeconds
	}: {
		name: string;
		timeoutSeconds: number[];
	}): Promise<ThrottlerProxy> {
		const id = Bindings.THROTTLER.idFromName(name);
		const stub = Bindings.THROTTLER.get(id);
		await stub.fetch('https://ficus-rate-limiter.local/set-params', {
			method: 'POST',
			body: JSON.stringify({ timeoutSeconds })
		});
		return new ThrottlerProxy(stub);
	}

	async consume(): Promise<boolean> {
		const resp = await this.stub.fetch('https://ficus-rate-limiter.local/consume', {
			method: 'POST'
		});
		return await resp.json();
	}

	async reset(): Promise<void> {
		await this.stub.fetch('https://ficus-rate-limiter.local/reset', {
			method: 'POST'
		});
	}
}
