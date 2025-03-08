// import { Bindings } from '$lib/server/bindings';
import { getNotesClient } from '$lib/server/notes/client';
import { fail, type Actions } from '@sveltejs/kit';
import type { NewNote } from '@ficus/service-notes/src/db/schema';

export const actions = {
	default: async (event) => {
		const userId = event.locals.user?.id;
		if (!userId) {
			return fail(401, {
				message: 'Unauthorized'
			});
		}

		const formData = await event.request.formData();
		const title = formData.get('title') as string;
		const content = formData.get('content') as string;

		const newNote: NewNote = {
			userId,
			title,
			content
		};

		// using note = await Bindings.NOTES.create(newNote);
		const notesClient = getNotesClient();
		const noteResp = await notesClient.create.$post({ json: newNote });
		if (noteResp.ok) {
			const note = await noteResp.json();
			return { note };
		}

		return fail(500, {
			message: 'Failed to create note'
		});
	}
} satisfies Actions;
