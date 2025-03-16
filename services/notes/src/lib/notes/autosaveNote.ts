import { Bindings } from '../bindings';

import type { NewNote } from '../../db/schema';

/**
 * Automatically saves a note with the given ID and attributes to KV storage and queues an autosave event.
 *
 * This function performs two operations:
 * 1. Stores the note data in KV storage with a key format of "notes:{noteId}"
 * 2. Sends a message to the AUTOSAVE_QUEUE with the note ID and current timestamp
 *
 * @param noteId - The unique identifier of the note to autosave
 * @param noteAttrs - The note attributes to be saved
 * @param noteAttrs.title - The title of the note
 * @param noteAttrs.content - The content of the note
 *
 * @returns A Promise that resolves when both the KV storage and queue operations complete
 */
export async function autosaveNote(
	{ noteId, userId }: { noteId: string; userId: string },
	noteAttrs: Partial<Pick<NewNote, 'title' | 'content'>>
): Promise<void> {
	await Bindings.KV.put(`notes:${noteId}`, JSON.stringify({ userId, ...noteAttrs }));
	await Bindings.AUTOSAVE_QUEUE.send({ noteId, timestamp: Date.now() });
}
