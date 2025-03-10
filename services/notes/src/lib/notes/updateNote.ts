import { db } from '../../db';
import { notesTable, type NewNote, type Note } from '../../db/schema';
import { and, eq } from 'drizzle-orm';

/**
 * Update an existing note in the database.
 */
export async function updateNote(
	{ noteId, userId }: { noteId: string; userId: string },
	data: Partial<NewNote>
): Promise<Note | null> {
	// Filter out undefined values to avoid overwriting with null
	const filteredData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));

	// Update the note in the database
	const [updatedNote] = await db
		.update(notesTable)
		.set(filteredData)
		.where(and(eq(notesTable.id, noteId), eq(notesTable.userId, userId)))
		.returning();

	return updatedNote || null;
}
