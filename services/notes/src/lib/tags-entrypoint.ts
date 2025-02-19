import { BaseModel } from './base-model';

export class TagsEntrypoint extends BaseModel {
	constructor(ctx: ExecutionContext, env: CloudflareBindings) {
		super(ctx, env, 'tags');
	}
}
