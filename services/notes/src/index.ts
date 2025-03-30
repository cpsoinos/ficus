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

export default {
	async fetch(request, env, ctx) {
		DbSingleton.initialize(env.DB);
		BindingsSingleton.initialize(env);

		return app.fetch(request, env, ctx);
	}
} satisfies ExportedHandler<Env>;
