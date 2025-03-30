import { and, eq } from 'drizzle-orm';

import { db } from '../../db';
import { Bindings } from '../bindings';

import { noteContentStoragePath } from './utils';

import type { NoteWithContent } from './types';

export async function findNoteById({
	noteId,
	userId
}: {
	noteId: string;
	userId: string;
}): Promise<NoteWithContent | undefined> {
	const note = await db.query.notesTable.findFirst({
		where: (table) => and(eq(table.id, noteId), eq(table.userId, userId))
	});
	if (!note) {
		return undefined;
	}

	const contentObj = await Bindings.R2.get(noteContentStoragePath(userId, noteId));
	const content = contentObj?.body ? await contentObj.text() : '';

	return { ...note, content };
}
