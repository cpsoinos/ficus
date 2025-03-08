import { app } from './app';
import { listNotes } from './listNotes';
import { findByIdWithAttachments } from './findByIdWithAttachments';
import { createNote } from './createNote';
import { updateNote } from './updateNote';
import { deleteNote } from './deleteNote';
import { BaseModel } from '../base-model';
import { type Note, type NewNote } from '../../db/schema';

export class NotesEntrypoint extends BaseModel<'notes'> {
	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env, 'notes');

		// for (const method of methods) {
		// 	app.post(method.name, async ({ req, json }) => {
		// 		const args = await req.json<Parameters<typeof method>>();
		// 		console.log('🚀 ~ NotesEntrypoint ~ app.post ~ args:', args);
		// 		const result = await method(...args);
		// 		console.log('🚀 ~ NotesEntrypoint ~ app.post ~ result:', result);
		// 		return json(result);
		// 	});
		// }
	}

	override fetch(req: Request) {
		return app.fetch(req);
		// const methods = [listNotes, findByIdWithAttachments, createNote, updateNote, deleteNote];
		// for (const method of methods) {
		// 	if (req.url.endsWith(method.name)) {
		// 		const args = await req.json<Parameters<typeof method>>();
		// 		console.log('🚀 ~ NotesEntrypoint ~ overridefetch ~ args:', args);
		// 		const result = await method(...[args]);
		// 		console.log('🚀 ~ NotesEntrypoint ~ overridefetch ~ result:', result);
		// 		return new Response(JSON.stringify(result));
		// 	}
		// }
	}

	/**
	 * Retrieve a list of note titles for a user.
	 */
	async listNotes(userId: string): Promise<Pick<Note, 'id' | 'title'>[]> {
		return listNotes(userId);
	}

	async findByIdWithAttachments({ noteId }: { noteId: string }) {
		return findByIdWithAttachments(noteId);
	}

	/**
	 * Create a new note.
	 */
	async createNote(data: NewNote) {
		return createNote(data);
	}

	/**
	 * Update an existing note.
	 */
	async updateNote(noteId: string, data: Partial<NewNote>) {
		return updateNote(noteId, data);
	}

	/**
	 * Delete a note.
	 */
	async deleteNote(noteId: string) {
		return deleteNote(noteId);
	}
}
