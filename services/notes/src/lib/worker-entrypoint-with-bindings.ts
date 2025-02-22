import { BindingsSingleton } from './bindings';
import { DbSingleton } from '../db';
import { WorkerEntrypoint } from 'cloudflare:workers';

export abstract class WorkerEntrypointWithBindings extends WorkerEntrypoint<Env> {
	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env);
		DbSingleton.initialize(env.DB);
		BindingsSingleton.initialize(env);
	}
}
