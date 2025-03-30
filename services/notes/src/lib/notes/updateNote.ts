import { noteContentStoragePath } from '@ficus/common';
import { and, eq } from 'drizzle-orm';

import { db } from '../../db';
import { notesTable, type NewNote } from '../../db/schema';
import { Bindings } from '../bindings';

import { findNoteById } from './findNoteById';

import type { NoteWithContent } from './types';

/**
 * Update an existing note in the database.
 */
export async function updateNote(
	{ noteId, userId }: { noteId: string; userId: string },
	metadata: Partial<NewNote>,
	content?: string
): Promise<NoteWithContent | undefined> {
	// Filter out undefined values to avoid overwriting with null
	const filteredData = Object.fromEntries(
		Object.entries(metadata).filter(([_, v]) => v !== undefined)
	);

	// Update the note in the database
	await db
		.update(notesTable)
		.set(filteredData)
		.where(and(eq(notesTable.id, noteId), eq(notesTable.userId, userId)));

	// Update the note content in R2 if it exists
	if (content) {
		await Bindings.R2.put(noteContentStoragePath(userId, noteId), content);
	}

	return await findNoteById({ noteId, userId });
}
