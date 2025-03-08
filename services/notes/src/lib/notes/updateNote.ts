import { db } from '../../db';
import { notesTable, type NewNote, type Note } from '../../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Update an existing note in the database.
 *
 * @param noteId The ID of the note to update
 * @param data The updated note data
 * @returns The updated note
 */
export async function updateNote(noteId: string, data: Partial<NewNote>): Promise<Note | null> {
	// Filter out undefined values to avoid overwriting with null
	const filteredData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));

	// Update the note in the database
	const [updatedNote] = await db
		.update(notesTable)
		.set({
			...filteredData,
			updatedAt: new Date()
		})
		.where(eq(notesTable.id, noteId))
		.returning();

	return updatedNote || null;
}
