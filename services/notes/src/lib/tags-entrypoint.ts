import { BaseModel } from './base-model';

export class TagsEntrypoint extends BaseModel<'tags'> {
	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env, 'tags');
	}
}
