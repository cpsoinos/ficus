export { RefillingTokenBucket } from './RefillingTokenBucket';
export { ExpiringTokenBucket } from './ExpiringTokenBucket';
export { Throttler } from './Throttler';

export default {
	async fetch(_request, _env, _ctx): Promise<Response> {
		// return error with message saying to use the DO binding directly
		return new Response('Use the DO binding directly', {
			status: 400
		});
	}
} satisfies ExportedHandler<Env>;
