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

		console.log(newNote);

		const notesClient = getNotesClient();
		const noteResp = await notesClient.create.$post({ json: newNote });

		if (!noteResp.ok) {
			const result = await noteResp.json();
			console.log('🚀 ~ actions ~ default ~ result:', JSON.stringify(result, undefined, 2));
			// @ts-expect-error hono zod validator doesn't work with middleware
			return fail(500, result.error?.issues);
		}

		const note = await noteResp.json();
		return { note };
	}
} satisfies Actions;
