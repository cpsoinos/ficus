import { updateNote } from './notes/updateNote';

import type { ExportedHandlerQueueHandler } from '@cloudflare/workers-types';

export const queueConsumer: ExportedHandlerQueueHandler<
	Env,
	{ noteId: string; timestamp: Date }
> = async (batch, env) => {
	for (const message of batch.messages) {
		const { noteId } = message.body;
		const noteAttrs = await env.KV.get<{ userId: string; title?: string; content?: string }>(
			`notes:${noteId}`,
			{ type: 'json' }
		);
		if (noteAttrs) {
			const { userId, title, content } = noteAttrs;
			await updateNote({ noteId, userId }, { title, content });
		}
	}
};
