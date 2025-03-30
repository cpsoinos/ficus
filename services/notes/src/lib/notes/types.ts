import { z } from 'zod';

import { type Note } from '../../db/schema';

export interface NoteWithContent extends Note {
	content: string;
}

const noteIncludesEnum = z.enum(['attachments', 'folder', 'tags']);

export const noteQueryIncludesSchema = z
	.array(noteIncludesEnum)
	.or(noteIncludesEnum.transform((val) => [val]));

export type NoteQueryIncludes = z.infer<typeof noteQueryIncludesSchema>;
