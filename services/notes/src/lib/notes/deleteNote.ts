import { db } from '../../db';
import { notesTable } from '../../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Delete a note from the database.
 *
 * @param noteId The ID of the note to delete
 * @returns void
 */
export async function deleteNote(noteId: string): Promise<void> {
	// Delete the note from the database
	await db.delete(notesTable).where(eq(notesTable.id, noteId));
}
