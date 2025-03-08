import { notesClient } from '$lib/server/notes/client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { noteId } = event.params;

	const noteResp = await notesClient.findByIdWithAttachments.$get({ query: { noteId } });

	if (noteResp.status === 404) {
		return { status: 404, error: 'Note not found' };
	}

	if (noteResp.ok) {
		const note = await noteResp.json();
		return { note };
	}

	return { status: 500, error: 'Failed to load note' };
};
