import { getNotesClient } from '$lib/server/notes/client';
import { Carta } from 'carta-md';
import DOMPurify from 'isomorphic-dompurify';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { user } = event.locals;
	if (!user) {
		return { status: 401, error: 'Unauthorized' };
	}

	const { noteId } = event.params;
	const notesClient = getNotesClient();

	const noteResp = await notesClient.findByIdWithAttachments.$get({
		query: { noteId, userId: user.id }
	});

	if (noteResp.status === 404) {
		return { status: 404, error: 'Note not found' };
	}

	if (noteResp.ok) {
		const note = await noteResp.json();

		const carta = new Carta({
			sanitizer: DOMPurify.sanitize
		});

		const html = await carta.render(note.content ?? '');

		return { note, html };
	}

	return { status: 500, error: 'Failed to load note' };
};
