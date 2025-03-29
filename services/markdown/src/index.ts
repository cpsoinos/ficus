import * as Sentry from '@sentry/cloudflare';

import { BindingsSingleton } from './lib/bindings';
import { render } from './render';

const handler = Sentry.withSentry(
	(_env) => ({
		dsn: 'https://116e96886fe4ee09842b9c4e8f11262e@o4509062120865792.ingest.us.sentry.io/4509062326190080',
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
