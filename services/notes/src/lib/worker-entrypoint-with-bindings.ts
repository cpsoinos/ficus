import { BindingsSingleton } from '../db/bindings';
import { WorkerEntrypoint } from 'cloudflare:workers';

export abstract class WorkerEntrypointWithBindings extends WorkerEntrypoint<CloudflareBindings> {
	constructor(ctx: ExecutionContext, env: CloudflareBindings) {
		super(ctx, env);
		BindingsSingleton.initialize(env);
	}
}
