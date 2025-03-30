import { z } from 'zod';

import { type Note } from '../../db/schema';

export interface NoteWithContent extends Note {
	content: string;
}

export const noteIncludesSchema = z.enum(['attachments', 'folder', 'tags']);

export const noteQueryIncludesSchema = z
	.array(noteIncludesSchema)
	.or(noteIncludesSchema.transform((val) => [val]));

export type NoteQueryIncludes = z.infer<typeof noteQueryIncludesSchema>;
