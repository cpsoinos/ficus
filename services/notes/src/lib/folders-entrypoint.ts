import { BaseModel } from './base-model';

export class FoldersEntrypoint extends BaseModel {
	constructor(ctx: ExecutionContext, env: CloudflareBindings) {
		super(ctx, env, 'folders');
	}
}
