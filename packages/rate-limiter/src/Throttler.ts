import { DurableObject } from 'cloudflare:workers';
import { Hono } from 'hono';

export class Throttler extends DurableObject {
  storage: DurableObjectStorage;
  app = new Hono<{ Bindings: Env }>();

  timeoutSeconds: number[] | null = null;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.storage = ctx.storage;

    this.app.post('/set-params', async (c) => {
      const { timeoutSeconds } = await c.req.json();
      await this.setParams({ timeoutSeconds });
      return c.status(200);
    });

    this.app.post('/consume', async (c) => {
      const response = await this.consume();
      return c.json(response);
    });

    this.app.post('/reset', async (c) => {
      await this.reset();
      return c.status(200);
    });
  }

  fetch(request: Request) {
    return this.app.fetch(request);
  }

  async setParams({
    timeoutSeconds,
  }: {
    timeoutSeconds: number[];
  }): Promise<void> {
    await this.storage.put('timeoutSeconds', timeoutSeconds);
    this.timeoutSeconds = timeoutSeconds;
  }

  private async getParams(): Promise<void> {
    if (this.timeoutSeconds) {
      return;
    }
    const timeoutSeconds = await this.storage.get<number[]>('timeoutSeconds');
    this.timeoutSeconds = timeoutSeconds ?? null;
  }

  async consume(): Promise<boolean> {
    await this.getParams();
    let counter =
      (await this.storage.get<ThrottlingCounter>('counter')) ?? null;
    const now = Date.now();
    if (counter === null) {
      counter = {
        timeout: 0,
        updatedAt: now,
      };
      await this.storage.put('counter', counter);
      return true;
    }
    const allowed =
      now - counter.updatedAt >= this.timeoutSeconds![counter.timeout] * 1000;
    if (!allowed) {
      return false;
    }
    counter.updatedAt = now;
    counter.timeout = Math.min(
      counter.timeout + 1,
      this.timeoutSeconds!.length - 1
    );
    await this.storage.put('counter', counter);
    return true;
  }

  async reset() {
    await this.storage.delete('counter');
  }
}

export interface ThrottlingCounter {
  timeout: number;
  updatedAt: number;
}
