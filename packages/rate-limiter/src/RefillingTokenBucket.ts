import { DurableObject } from 'cloudflare:workers';
import { Hono } from 'hono';

export class RefillingTokenBucket extends DurableObject {
  storage: DurableObjectStorage;
  app = new Hono<{ Bindings: Env }>();

  refillRate: number | null = null; // Tokens added per second
  capacity: number | null = null; // Maximum number of tokens
  updateMs: number | null = null; // Interval to update the token count (Alarm interval in milliseconds)

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.storage = ctx.storage;

    this.app.post('/set-params', async (c) => {
      const { refillRate, capacity, updateMs } = await c.req.json();
      this.setParams({ refillRate, capacity, updateMs });
      return c.status(200);
    });

    this.app.post('/consume', async (c) => {
      const { tokens } = await c.req.json();
      const response = await this.consume(tokens);
      return c.json(response);
    });
  }

  // Fetch handler since RPC is not yet supported between multiple `wrangler dev` sessions
  async fetch(request: Request) {
    return this.app.fetch(request);
  }

  async setParams({
    refillRate,
    capacity,
    updateMs,
  }: {
    refillRate: number;
    capacity: number;
    updateMs: number;
  }): Promise<void> {
    await Promise.all([
      this.storage.put('refillRate', refillRate),
      this.storage.put('capacity', capacity),
      this.storage.put('updateMs', updateMs),
    ]);
    this.refillRate = refillRate;
    this.capacity = capacity;
    this.updateMs = updateMs;
  }

  private async getParams(): Promise<void> {
    const [refillRate, capacity, updateMs] = await Promise.all([
      this.storage.get<number>('refillRate'),
      this.storage.get<number>('capacity'),
      this.storage.get<number>('updateMs'),
    ]);
    this.refillRate = refillRate ?? null;
    this.capacity = capacity ?? null;
    this.updateMs = updateMs ?? null;
  }

  // RPC method to consume tokens
  async consume(tokens = 1): Promise<{
    allowed: boolean;
    remainingTokens: number;
    nextRefillTime?: number;
  }> {
    if (!this.refillRate || !this.capacity || !this.updateMs) {
      throw new Error('Params not set!');
    }
    await this.refillTokens();

    let remainingTokens =
      (await this.storage.get<number>('remainingTokens')) ?? this.capacity;

    if (remainingTokens >= tokens) {
      remainingTokens -= tokens;
      await this.storage.put('remainingTokens', remainingTokens);
      await this.checkAndSetAlarm();
      return { allowed: true, remainingTokens };
    }

    await this.checkAndSetAlarm();
    return {
      allowed: false,
      remainingTokens,
      nextRefillTime: await this.getNextRefillTime(),
    };
  }

  private async getNextRefillTime(): Promise<number> {
    const now = Date.now();
    const lastRefillTime =
      (await this.storage.get<number>('lastRefillTime')) ?? now;
    const elapsedMilliseconds = now - lastRefillTime;
    return lastRefillTime + elapsedMilliseconds;
  }

  // Refills tokens based on elapsed time
  private async refillTokens(): Promise<void> {
    if (!this.refillRate || !this.capacity || !this.updateMs) {
      throw new Error('Params not set!');
    }
    const now = Date.now();
    const lastRefillTime =
      (await this.storage.get<number>('lastRefillTime')) ?? now;

    const elapsedMilliseconds = now - lastRefillTime;
    const refillTokens = Math.floor(
      (elapsedMilliseconds / 1000) * this.refillRate
    );

    let remainingTokens =
      (await this.storage.get<number>('remainingTokens')) ?? this.capacity;

    if (refillTokens > 0) {
      remainingTokens = Math.min(this.capacity, remainingTokens + refillTokens);
      await this.storage.put('remainingTokens', remainingTokens);
    }
    await this.storage.put('lastRefillTime', now);
  }

  // Alarm handler for periodic token refill
  async alarm(): Promise<void> {
    // get params from storage
    await this.getParams();
    await this.refillTokens();
    await this.checkAndSetAlarm();
  }

  // Ensures the alarm is set only when tokens are below capacity
  private async checkAndSetAlarm(): Promise<void> {
    if (!this.refillRate || !this.capacity || !this.updateMs) {
      throw new Error('Params not set!');
    }
    const remainingTokens =
      (await this.storage.get<number>('remainingTokens')) ?? this.capacity;

    if (remainingTokens < this.capacity) {
      const currentAlarm = await this.ctx.storage.getAlarm();
      if (currentAlarm == null) {
        this.storage.setAlarm(Date.now() + this.updateMs);
      }
    }
  }
}
