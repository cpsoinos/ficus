import { noteContentStoragePath } from '@ficus/common';
import { and, eq } from 'drizzle-orm';

import { db } from '../../db';
import { notesTable } from '../../db/schema';
import { Bindings } from '../bindings';

/**
 * Delete a note and associated attachments from the database.
 * Also deletes the attachments from the object store.
 *
 * @returns void
 */
export async function deleteNote({
	noteId,
	userId
}: {
	noteId: string;
	userId: string;
}): Promise<void> {
	// eslint-disable-next-line drizzle/enforce-delete-with-where
	const contentDeletionPromise = Bindings.R2.delete(noteContentStoragePath(userId, noteId));

	const attachments = await db.query.attachmentsTable.findMany({
		where: (table) => eq(table.noteId, noteId)
	});
	const attachmentObjDeletionPromises = attachments.map((attachment) => {
		// eslint-disable-next-line drizzle/enforce-delete-with-where
		return Bindings.R2.delete(attachment.fileUrl);
	});

	await Promise.all([
		contentDeletionPromise,
		...attachmentObjDeletionPromises,
		// Delete the note from the database. This will also delete any attachments associated with the note.
		db.delete(notesTable).where(and(eq(notesTable.id, noteId), eq(notesTable.userId, userId)))
	]);
}
