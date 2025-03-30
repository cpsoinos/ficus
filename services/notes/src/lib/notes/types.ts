import { z } from 'zod';

import { type NewNote, type Note } from '../../db/schema';

export interface NoteWithContent extends Note {
	content: string;
}

export interface NewNoteWithContent extends NewNote {
	content: string;
}

const noteIncludesEnum = z.enum(['attachments', 'folder', 'tags']);

export const noteQueryIncludesSchema = z
	.array(noteIncludesEnum)
	.or(noteIncludesEnum.transform((val) => [val]));

export type NoteQueryIncludes = z.infer<typeof noteQueryIncludesSchema>;
