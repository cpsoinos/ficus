import { Bindings } from '$lib/server/bindings';
import { getNotesClient } from '$lib/server/notes/client';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { user } = event.locals;
	if (!user) {
		return { status: 401, error: 'Unauthorized' };
	}

	const { noteId } = event.params;
	const notesClient = getNotesClient();

	const noteResp = await notesClient[':noteId'].$get({
		param: { noteId },
		query: { userId: user.id, includes: ['attachments'] }
	});

	if (noteResp.status === 404) {
		return { status: 404, error: 'Note not found' };
	}

	if (noteResp.ok) {
		const note = await noteResp.json();
		const html = await (
			await Bindings.MARKDOWN.fetch('http://internal', {
				method: 'POST',
				body: note.content
			})
		).text();

		return { note, html };
	}

	return { status: 500, error: 'Failed to load note' };
};
