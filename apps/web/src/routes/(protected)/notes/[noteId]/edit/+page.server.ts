import { fail, redirect } from '@sveltejs/kit';

import { getNotesClient } from '$lib/server/clients';

import type { Actions, PageServerLoad } from './$types';

export const ssr = false;

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
		return { note };
	}

	return { status: 500, error: 'Failed to load note' };
};

export const actions = {
	update: async (event) => {
		const userId = event.locals.user?.id;
		if (!userId) {
			return fail(401, {
				message: 'Unauthorized'
			});
		}

		const noteId = event.params.noteId;
		const formData = await event.request.formData();
		const title = formData.get('title') as string;
		const content = formData.get('content') as string;

		const noteAttrs = {
			userId,
			title,
			content
		};

		const notesClient = getNotesClient();
		const noteResp = await notesClient[':noteId'].$put({
			param: { noteId },
			query: { userId },
			json: noteAttrs
		});

		if (!noteResp.ok) {
			const result = await noteResp.json();
			// @ts-expect-error hono zod validator doesn't work with middleware
			const zodError = new ZodError(result.error.issues);
			const error = zodError.format();
			return fail(500, { error });
		}

		const note = await noteResp.json();
		return { note };
	},

	delete: async (event) => {
		const userId = event.locals.user?.id;
		if (!userId) {
			return fail(401, {
				message: 'Unauthorized'
			});
		}

		const noteId = event.params.noteId;
		const notesClient = getNotesClient();
		const noteResp = await notesClient[':noteId'].$delete({ param: { noteId }, query: { userId } });

		if (!noteResp.ok) {
			const result = await noteResp.json();
			// @ts-expect-error hono zod validator doesn't work with middleware
			const zodError = new ZodError(result.error.issues);
			const error = zodError.format();
			return fail(500, { error });
		}

		return redirect(302, '/');
	}
} satisfies Actions;
