import { app } from './app';
import { listNotes } from './listNotes';
import { findByIdWithAttachments } from './findByIdWithAttachments';
import { BaseModel } from '../base-model';
import { type Note } from '../../db/schema';

export class NotesEntrypoint extends BaseModel<'notes'> {
	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env, 'notes');
	}

	override fetch(req: Request) {
		return app.fetch(req);
	}

	/**
	 * Retrieve a list of note titles for a user.
	 */
	async listNotes(userId: string): Promise<Pick<Note, 'id' | 'title'>[]> {
		return listNotes(userId);
	}

	async findByIdWithAttachments(noteId: string) {
		return findByIdWithAttachments(noteId);
	}
}
