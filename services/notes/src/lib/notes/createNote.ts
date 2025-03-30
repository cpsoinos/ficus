import { db } from '../../db';
import { notesTable, type NewNote, type Note } from '../../db/schema';
import { Bindings } from '../bindings';

import { noteContentStoragePath } from './utils';

/**
 * Create a new note. Stores metadata in the database and content in R2.
 */
export async function createNote(metadata: NewNote, content?: string): Promise<Note> {
	// Insert the note metadata into the database
	const [insertedNote] = await db.insert(notesTable).values(metadata).returning();
	// Store the note content in R2
	await Bindings.R2.put(
		noteContentStoragePath(insertedNote.userId, insertedNote.id),
		content ?? ''
	);

	return insertedNote;
}
