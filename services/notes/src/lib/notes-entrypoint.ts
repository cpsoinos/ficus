import { BaseModel } from './base-model';
import { db } from '../db';
import { notesTable, type Note } from '../db/schema';
import { eq } from 'drizzle-orm';

export class NotesEntrypoint extends BaseModel<'notes'> {
	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env, 'notes');
	}

	/**
	 * Retrieve a list of note titles for a user.
	 */
	async listNotes(userId: string): Promise<Pick<Note, 'id' | 'title'>[]> {
		return db.query.notesTable.findMany({
			columns: {
				id: true,
				title: true
			},
			where: eq(notesTable.userId, userId)
		});
	}

	async findByIdWithAttachments(noteId: string) {
		return db.query.notesTable.findFirst({
			where: eq(notesTable.id, noteId),
			with: {
				attachments: true
			}
		});
	}
}
