// Generated by Wrangler by running `wrangler types`

interface Env {
	REFILLING_TOKEN_BUCKET: DurableObjectNamespace<
		import('@ficus/rate-limiter/src/index').RefillingTokenBucket
	>;
	DB: D1Database;
	ARGON2: Fetcher;
}
