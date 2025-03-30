import { eq } from 'drizzle-orm';

import { db } from '../../db';
import { tagsTable } from '../../db/schema';

export async function listTags(userId: string) {
	return db.query.tagsTable.findMany({
		columns: {
			id: true,
			name: true
		},
		where: eq(tagsTable.userId, userId)
	});
}
