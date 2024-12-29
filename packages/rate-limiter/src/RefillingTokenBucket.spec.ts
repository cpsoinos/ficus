import {
  env,
  runDurableObjectAlarm,
  runInDurableObject,
} from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import { RefillingTokenBucket } from './RefillingTokenBucket';

describe('RefillingTokenBucket', () => {
  it('should allow token consumption within capacity', async () => {
    // Check sending request directly to instance
    const id = env.REFILLING_TOKEN_BUCKET.idFromName('/path');
    const stub = env.REFILLING_TOKEN_BUCKET.get(id);

    const response = await runInDurableObject(stub, (instance) => {
      expect(instance).toBeInstanceOf(RefillingTokenBucket); // Exact same class as import
      return instance.consume(1);
    });

    expect(response).toEqual({ allowed: true, remainingTokens: 9 });
  });

  it('should disallow token consumption exceeding capacity', async () => {
    const id = env.REFILLING_TOKEN_BUCKET.idFromName('/path');
    const stub = env.REFILLING_TOKEN_BUCKET.get(id);

    const response = await runInDurableObject(stub, (instance) => {
      return instance.consume(11);
    });

    expect(response.allowed).toBe(false);
    expect(response.remainingTokens).toBe(10);
  });

  describe('refillTokens', () => {
    it('should not refill tokens more frequently than the refill rate', async () => {
      const id = env.REFILLING_TOKEN_BUCKET.idFromName('/path');
      const stub = env.REFILLING_TOKEN_BUCKET.get(id);

      await runInDurableObject(stub, (instance) => {
        return instance.consume(10);
      });

      await runInDurableObject(stub, (instance) => {
        return instance.storage.setAlarm(Date.now() + env.UPDATE_INTERVAL_MS);
      });

      // Immediately execute the alarm to reset the counter
      let ran = await runDurableObjectAlarm(stub);
      expect(ran).toBe(true); // ...as there was an alarm scheduled

      const remainingTokens = await runInDurableObject(stub, (instance) => {
        return instance.storage.get<number>('remainingTokens');
      });

      expect(remainingTokens).toBe(0);
    });

    it('should refill tokens on alarm based on elapsed time', async () => {
      const id = env.REFILLING_TOKEN_BUCKET.idFromName('/path');
      const stub = env.REFILLING_TOKEN_BUCKET.get(id);

      await runInDurableObject(stub, async (instance) => {
        await instance.consume(10);
        await instance.storage.put('lastRefillTime', Date.now() - 3000);
        await instance.storage.setAlarm(Date.now() + env.UPDATE_INTERVAL_MS);
      });

      // Immediately execute the alarm to reset the counter
      let ran = await runDurableObjectAlarm(stub);
      expect(ran).toBe(true); // ...as there was an alarm scheduled

      const remainingTokens = await runInDurableObject(stub, (instance) => {
        return instance.storage.get<number>('remainingTokens');
      });

      expect(remainingTokens).toBe(6);
    });
  });
});
