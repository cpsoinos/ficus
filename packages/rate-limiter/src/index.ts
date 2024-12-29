export { RefillingTokenBucket as RefillingTokenBucket } from './RefillingTokenBucket';

export default {
  async fetch(_request, _env, _ctx): Promise<Response> {
    // return error with message saying to use the RefillingTokenBucket binding directly
    return new Response('Use the RefillingTokenBucket binding directly', {
      status: 400,
    });
  },
} satisfies ExportedHandler<Env>;
