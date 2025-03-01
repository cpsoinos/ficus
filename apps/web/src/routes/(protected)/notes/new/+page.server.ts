import { Bindings } from '$lib/server/bindings';
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

		using note = await Bindings.NOTES.create(newNote);

		return { note };
	}
} satisfies Actions;
