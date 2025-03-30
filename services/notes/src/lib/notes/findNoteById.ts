import { and, eq } from 'drizzle-orm';

import { db } from '../../db';

import type { Note } from '../../db/schema';

export async function findNoteById({
	noteId,
	userId
}: {
	noteId: string;
	userId: string;
}): Promise<Note | undefined> {
	return db.query.notesTable.findFirst({
		where: (table) => and(eq(table.id, noteId), eq(table.userId, userId))
	});
}
