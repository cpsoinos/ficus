import { BaseModel } from './base-model';

export class NotesEntrypoint extends BaseModel {
	constructor(ctx: ExecutionContext, env: CloudflareBindings) {
		super(ctx, env, 'notes');
	}
}
