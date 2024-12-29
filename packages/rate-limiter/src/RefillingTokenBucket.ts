import { DurableObject } from 'cloudflare:workers';

export class RefillingTokenBucket extends DurableObject {
  storage: DurableObjectStorage;

  refillRate: number | null = null; // Tokens added per second
  capacity: number | null = null; // Maximum number of tokens
  updateMs: number | null = null; // Interval to update the token count (Alarm interval in milliseconds)

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.storage = ctx.storage;
  }

  setParams({
    refillRate,
    capacity,
    updateMs,
  }: {
    refillRate: number;
    capacity: number;
    updateMs: number;
  }): void {
    this.refillRate = refillRate;
    this.capacity = capacity;
    this.updateMs = updateMs;
  }

  // RPC method to consume tokens
  async consume(
    tokens = 1
  ): Promise<{ allowed: boolean; remainingTokens: number }> {
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
    return { allowed: false, remainingTokens };
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
      await this.storage.put('lastRefillTime', now);
    }
  }

  // Alarm handler for periodic token refill
  async alarm(): Promise<void> {
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
