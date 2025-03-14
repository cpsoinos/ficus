import { BaseModel } from '../base-model';

import { app } from './app';

export class NotesEntrypoint extends BaseModel<'notes'> {
	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env, 'notes');
	}

	override fetch(req: Request) {
		return app.fetch(req);
	}
}
