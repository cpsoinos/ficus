import { findByIdWithAttachments } from './findByIdWithAttachments';
import { listNotes } from './listNotes';
import { createNote } from './createNote';
import { updateNote } from './updateNote';
import { deleteNote } from './deleteNote';
import { noteInsertSchema } from '../../db/schema';
import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const router = new Hono<{ Bindings: Env }>();

// router.get('/', async ({ req, json }) => {
// 	const userId = req.param('userId');
// 	if (!userId) {
// 		return json({ error: 'userId is required' }, 400);
// 	}
// 	const notes = await listNotes(userId);
// 	return json(notes);
// });

router.post('/', async ({ req, json }) => {
	try {
		const body = await req.json();
		const { userId, title, content, folderId } = body;

		if (!userId) {
			return json({ error: 'userId is required' }, 400);
		}

		if (!title) {
			return json({ error: 'title is required' }, 400);
		}

		const note = await createNote({ userId, title, content, folderId });
		return json(note, 201);
	} catch (error) {
		console.error(error);
		return json({ error: 'Failed to create note' }, 500);
	}
});

router.put('/:noteId', async ({ req, json }) => {
	try {
		const noteId = req.param('noteId');
		const body = await req.json();
		const { title, content, folderId } = body;

		if (!noteId) {
			return json({ error: 'noteId is required' }, 400);
		}

		const note = await updateNote(noteId, { title, content, folderId });
		return json(note);
	} catch (error) {
		console.error(error);
		return json({ error: 'Failed to update note' }, 500);
	}
});

// eslint-disable-next-line drizzle/enforce-delete-with-where
router.delete('/:noteId', async ({ req, json }) => {
	try {
		const noteId = req.param('noteId');

		if (!noteId) {
			return json({ error: 'noteId is required' }, 400);
		}

		await deleteNote(noteId);
		return json({ success: true });
	} catch (error) {
		console.error(error);
		return json({ error: 'Failed to delete note' }, 500);
	}
});

export const app = new Hono<{ Bindings: Env }>();

app.route('/:userId/notes', router);

const _route = app
	.get(
		'/findByIdWithAttachments',
		zValidator(
			'query',
			z.object({
				noteId: z.string()
			})
		),
		async (c) => {
			const { noteId } = c.req.valid('query');
			const note = await findByIdWithAttachments(noteId);

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
	// .post('/create', zValidator('json', noteInsertSchema), async (c) => {
	.post(
		'/create',
		// validator('json', async (value, c) => {
		// 	const parsed = noteInsertSchema.safeParse(value);
		// 	if (parsed.success) {
		// 		return parsed.data;
		// 	}
		// 	return c.json({ error: 'Invalid input' }, 400);
		// }),
		//  zValidator('json', z.object(noteInsertSchema.shape)),
		zValidator('json', noteInsertSchema),
		async (c) => {
			const { userId, title, content, folderId } = c.req.valid('json');
			// console.log('ohai');
			// const parsed = await noteInsertSchema.safeParseAsync(await c.req.json());
			// console.log(parsed);

			const note = await createNote({ userId, title, content, folderId });
			return c.json(note, 201);
			// return c.json({ success: false });
		}
	);

export type NotesAppType = typeof _route;
