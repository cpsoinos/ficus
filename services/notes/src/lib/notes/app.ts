import { findByIdWithAttachments } from './findByIdWithAttachments';
import { listNotes } from './listNotes';
import { createNote } from './createNote';
import { updateNote } from './updateNote';
import { deleteNote } from './deleteNote';
import { noteInsertSchema, noteUpdateSchema } from '../../db/schema';
import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

export const app = new Hono<{ Bindings: Env }>();

// eslint-disable-next-line drizzle/enforce-delete-with-where
const _route = app
	.get(
		'/findByIdWithAttachments',
		zValidator(
			'query',
			z.object({
				noteId: z.string(),
				userId: z.string()
			})
		),
		async (c) => {
			const { noteId, userId } = c.req.valid('query');
			const note = await findByIdWithAttachments({ noteId, userId });

			if (note === undefined) {
				return c.json({ error: 'Note not found' }, 404);
			}

			return c.json(note, 200);
		}
	)
	.get('/list', zValidator('query', z.object({ userId: z.string() })), async (c) => {
		const { userId } = c.req.valid('query');
		const notes = await listNotes(userId);
		return c.json(notes, 200);
	})
	.post('/create', zValidator('json', noteInsertSchema), async (c) => {
		const { userId, title, content, folderId } = c.req.valid('json');
		const note = await createNote({ userId, title, content, folderId });
		return c.json(note, 201);
	})
	.put('/:noteId', zValidator('json', noteUpdateSchema), async (c) => {
		const noteId = c.req.param('noteId');
		const { title, content, folderId } = c.req.valid('json');
		const note = await updateNote(noteId, { title, content, folderId });
		return c.json(note, 200);
	})
	.delete('/:noteId', zValidator('param', z.object({ noteId: z.string() })), async (c) => {
		const { noteId } = c.req.valid('param');
		await deleteNote(noteId);
		return c.json({ success: true }, 200);
	});

export type NotesAppType = typeof _route;
