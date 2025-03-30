import type { Note } from '../../db/schema';

export interface NoteWithContent extends Note {
	content: string;
}
