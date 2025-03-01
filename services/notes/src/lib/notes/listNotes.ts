import { db } from '../../db';
import { type Note, notesTable } from '../../db/schema';
import { eq } from 'drizzle-orm';

export function listNotes(userId: string): Promise<Pick<Note, 'id' | 'title'>[]> {
	return db.query.notesTable.findMany({
		columns: {
			id: true,
			title: true
		},
		where: eq(notesTable.userId, userId)
	});
}
