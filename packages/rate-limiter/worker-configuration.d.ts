// Generated by Wrangler by running `wrangler types`

interface Env {
	REFILLING_TOKEN_BUCKET: DurableObjectNamespace<import('./src/index').RefillingTokenBucket>;
	EXPIRING_TOKEN_BUCKET: DurableObjectNamespace<import('./src/index').ExpiringTokenBucket>;
	THROTTLER: DurableObjectNamespace<import('./src/index').Throttler>;
}
