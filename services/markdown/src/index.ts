import * as Sentry from '@sentry/cloudflare';

import { BindingsSingleton } from './lib/bindings';
import { render } from './render';

const handler = Sentry.withSentry(
	(_env) => ({
		dsn: 'https://6f53f64e54966ce49795387f356e4bff@o4508996084039680.ingest.us.sentry.io/4509027808837632',
		// Set tracesSampleRate to 1.0 to capture 100% of spans for tracing.
		// Learn more at
		// https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
		tracesSampleRate: 1.0
	}),
	{
		async fetch(request, env, _ctx): Promise<Response> {
			BindingsSingleton.initialize(env);
			const body = await request.text();
			const html = await render(body);
			return new Response(html);
		}
	} satisfies ExportedHandler<Env>
);

export default handler;
