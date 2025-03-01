import { findByIdWithAttachments } from './findByIdWithAttachments';
import { listNotes } from './listNotes';
import { Hono } from '@hono/hono';

export const app = new Hono<{ Bindings: Env }>();

app.get('/notes', async ({ req, json }) => {
	const userId = req.query('userId');
	if (!userId) {
		return json({ error: 'userId is required' }, 400);
	}
	const notes = await listNotes(userId);
	return json(notes);
});

app.get('/notes/:noteId', async ({ req, json }) => {
	const noteId = req.param('noteId');
	const userId = req.query('userId');
	if (!userId) {
		return json({ error: 'userId is required' }, 400);
	}
	// const withQuery = req.query('with');
	// const withRelations = withQuery ? JSON.parse(withQuery) : {};
	const note = await findByIdWithAttachments(noteId);
	return json(note);
});
