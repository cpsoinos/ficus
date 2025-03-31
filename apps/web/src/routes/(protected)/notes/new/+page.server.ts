import { fail, redirect, type Actions } from '@sveltejs/kit';
import { ZodError } from 'zod';

import { getNotesClient } from '$lib/server/clients';

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

		const notesClient = getNotesClient();
		const noteResp = await notesClient.create.$post({ json: newNote });

		if (!noteResp.ok) {
			const result = await noteResp.json();
			// @ts-expect-error hono zod validator doesn't work with middleware
			const zodError = new ZodError(result.error.issues);
			const error = zodError.format();
			return fail(500, { error });
		}

		const note = await noteResp.json();

		return redirect(302, `/notes/${note.id}/edit`);
	}
} satisfies Actions;
