import { listFolders } from './listFolders';
import { app } from './app';
import { BaseModel } from '../base-model';

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
