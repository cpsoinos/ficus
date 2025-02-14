import { DurableObject } from 'cloudflare:workers';
import { Hono } from '@hono/hono';

export class ExpiringTokenBucket extends DurableObject {
	storage: DurableObjectStorage;
	app = new Hono<{ Bindings: Env }>();

	max: number | null = null;
	expiresInSeconds: number | null = null;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.storage = ctx.storage;

		this.app.post('/set-params', async (c) => {
			const { max, expiresInSeconds } = await c.req.json();
			await this.setParams({ max, expiresInSeconds });
			return c.status(200);
		});

		this.app.post('/check', async (c) => {
			const { key, cost } = await c.req.json();
			const response = await this.check(key, cost);
			return c.json(response);
		});

		this.app.post('/consume', async (c) => {
			const { key, cost } = await c.req.json();
			const response = await this.consume(key, cost);
			return c.json(response);
		});

		this.app.post('/reset', async (c) => {
			const { key } = await c.req.json();
			this.reset(key);
			return c.status(200);
		});
	}

	async setParams({
		max,
		expiresInSeconds
	}: {
		max: number;
		expiresInSeconds: number;
	}): Promise<void> {
		await Promise.all([
			this.storage.put('max', max),
			this.storage.put('expiresInSeconds', expiresInSeconds)
		]);
		this.max = max;
		this.expiresInSeconds = expiresInSeconds;
	}

	private async getParams(): Promise<void> {
		if (this.max && this.expiresInSeconds) {
			return;
		}
		const [max, expiresInSeconds] = await Promise.all([
			this.storage.get<number>('max'),
			this.storage.get<number>('expiresInSeconds')
		]);
		this.max = max ?? null;
		this.expiresInSeconds = expiresInSeconds ?? null;
	}

	// Fetch handler since RPC is not yet supported between multiple `wrangler dev` sessions
	override fetch(request: Request) {
		return this.app.fetch(request);
	}

	async check(key: string, cost: number): Promise<boolean> {
		await this.getParams();
		const bucket = (await this.storage.get<ExpiringBucket>(key)) ?? null;
		const now = Date.now();
		if (!bucket) {
			return true;
		}
		if (now - bucket.createdAt >= this.expiresInSeconds! * 1000) {
			return true;
		}
		return bucket.count >= cost;
	}

	async consume(key: string, cost: number): Promise<boolean> {
		await this.getParams();
		let bucket = (await this.storage.get<ExpiringBucket>(key)) ?? null;
		const now = Date.now();
		if (bucket === null) {
			bucket = {
				count: this.max! - cost,
				createdAt: now
			};
			await this.storage.put(key, bucket);
			return true;
		}
		if (now - bucket.createdAt >= this.expiresInSeconds! * 1000) {
			bucket.count = this.max!;
		}
		if (bucket.count < cost) {
			return false;
		}
		bucket.count -= cost;
		await this.storage.put(key, bucket);
		return true;
	}

	public reset(key: string): void {
		this.storage.delete(key);
	}
}

export interface ExpiringBucket {
	count: number;
	createdAt: number;
}
