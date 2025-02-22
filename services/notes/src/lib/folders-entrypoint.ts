import { BaseModel } from './base-model';

export class FoldersEntrypoint extends BaseModel {
	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env, 'folders');
	}
}
