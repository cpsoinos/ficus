export { RateLimiter } from './RateLimiter';

export default {
  async fetch(_request, _env, _ctx): Promise<Response> {
    // return error with message saying to use the RateLimiter binding directly
    return new Response('Use the RateLimiter binding directly', {
      status: 400,
    });
  },
} satisfies ExportedHandler<Env>;
