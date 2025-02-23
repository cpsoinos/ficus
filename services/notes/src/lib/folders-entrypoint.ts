import { BaseModel } from './base-model';
import { db } from '../db';
import { foldersTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export class FoldersEntrypoint extends BaseModel<'folders'> {
	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env, 'folders');
	}

	/**
	 * Retrieve a list of folder names and their subfolders and notes for a user.
	 */
	async listFolders(userId: string) {
		return db.query.foldersTable.findMany({
			columns: {
				id: true,
				name: true
			},
			with: {
				notes: {
					columns: {
						id: true,
						title: true
					}
				},
				subFolders: {
					columns: {
						id: true,
						name: true
					},
					with: {
						notes: {
							columns: {
								id: true,
								title: true
							}
						}
					}
				}
			},
			where: eq(foldersTable.userId, userId)
		});
	}
}
