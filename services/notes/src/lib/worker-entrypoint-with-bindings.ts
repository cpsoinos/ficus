import { WorkerEntrypoint } from 'cloudflare:workers';

import { DbSingleton } from '../db';

import { BindingsSingleton } from './bindings';

export abstract class WorkerEntrypointWithBindings extends WorkerEntrypoint<Env> {
	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env);
		DbSingleton.initialize(env.DB);
		BindingsSingleton.initialize(env);
	}
}
