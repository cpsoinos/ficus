import { noteContentStoragePath } from '@ficus/common';
import { and, eq } from 'drizzle-orm';

import { db } from '../../db';
import { Bindings } from '../bindings';

import type { NoteQueryIncludes, NoteWithContent } from './types';

export async function findNoteById({
	noteId,
	userId,
	includes = []
}: {
	noteId: string;
	userId: string;
	includes?: NoteQueryIncludes;
}): Promise<NoteWithContent | undefined> {
	const includesClause = includes.reduce((acc, include) => {
		return {
			...acc,
			[include]: true
		};
	}, {});

	const note = await db.query.notesTable.findFirst({
		where: (table) => and(eq(table.id, noteId), eq(table.userId, userId)),
		with: includesClause
	});
	if (!note) {
		return undefined;
	}

	const contentObj = await Bindings.R2.get(noteContentStoragePath(userId, noteId));
	const content = contentObj?.body ? await contentObj.text() : '';

	return { ...note, content };
}
