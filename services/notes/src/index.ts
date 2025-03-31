import * as Sentry from '@sentry/cloudflare';
import { Hono } from 'hono';

import { DbSingleton } from './db';
import { app as attachmentsRouter } from './lib/attachments/app';
import { BindingsSingleton } from './lib/bindings';
import { app as foldersRouter } from './lib/folders/app';
import { app as notesRouter } from './lib/notes/app';
import { app as tagsRouter } from './lib/tags/app';

const app = new Hono()
	.route('/notes', notesRouter)
	.route('/folders', foldersRouter)
	.route('/attachments', attachmentsRouter)
	.route('/tags', tagsRouter);

const handler = Sentry.withSentry(
	(_env) => ({
		dsn: 'https://5147d5c8e34a34286f5acf829bdf850b@o4509062120865792.ingest.us.sentry.io/4509062317080576',
		// Set tracesSampleRate to 1.0 to capture 100% of spans for tracing.
		// Learn more at
		// https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
		tracesSampleRate: 1.0
	}),
	{
		async fetch(request, env, ctx) {
			DbSingleton.initialize(env.DB);
			BindingsSingleton.initialize(env);

			return app.fetch(request, env, ctx);
		}
	} satisfies ExportedHandler<Env>
);

export default handler;
