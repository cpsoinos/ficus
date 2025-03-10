import { db } from '../../db';
import { notesTable, type NewNote, type Note } from '../../db/schema';

/**
 * Create a new note in the database.
 *
 * @param data The note data to insert
 * @returns The created note
 */
export async function createNote(data: NewNote): Promise<Note> {
	// Insert the note into the database
	const [insertedNote] = await db.insert(notesTable).values(data).returning();

	return insertedNote;
}
