import { app } from './app';
import { listNotes } from './listNotes';
import { findByIdWithAttachments } from './findByIdWithAttachments';
import { BaseModel } from '../base-model';
import { type Note } from '../../db/schema';
import { RpcTarget } from 'cloudflare:workers';

export class NotesEntrypoint extends BaseModel<'notes'> {
	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env, 'notes');
	}

	override fetch(req: Request) {
		return app.fetch(req);
	}

	getCounter() {
		return new Counter();
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

class Counter extends RpcTarget {
	#value = 0;

	increment(amount: number) {
		this.#value += amount;
		return this.#value;
	}

	get value() {
		return this.#value;
	}
}
