import { BaseModel } from './base-model';

export class NotesEntrypoint extends BaseModel {
	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env, 'notes');
	}
}
