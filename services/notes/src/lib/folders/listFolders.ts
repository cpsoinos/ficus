import { eq } from 'drizzle-orm';

import { db } from '../../db';
import { foldersTable } from '../../db/schema';

export async function listFolders(userId: string) {
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
