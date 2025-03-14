import { BaseModel } from '../base-model';

import { app } from './app';
import { listFolders } from './listFolders';

export class FoldersEntrypoint extends BaseModel<'folders'> {
	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env, 'folders');
	}

	/**
	 * Retrieve a list of folder names and their subfolders and notes for a user.
	 */
	async listFolders(userId: string) {
		return listFolders(userId);
	}

	override fetch(req: Request) {
		return app.fetch(req);
	}
}
