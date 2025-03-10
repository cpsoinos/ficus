import { getNotesClient } from '$lib/server/notes/client';
import type { NewNote } from '@ficus/service-notes/src/db/schema/notes';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ locals, request, params }) => {
	const userId = locals.user?.id;
	if (!userId) {
		return new Response('Unauthorized', { status: 401 });
	}

	const noteId = params.noteId;
	const formData = await request.formData();
	const title = formData.get('title') as string;
	const content = formData.get('content') as string;

	const noteAttrs: NewNote = {
		userId,
		title,
		content
	};

	const notesClient = getNotesClient();
	const noteResp = await notesClient[':noteId'].$put({ param: { noteId }, json: noteAttrs });

	if (!noteResp.ok) {
		const result = await noteResp.json();
		// @ts-expect-error hono zod validator doesn't work with middleware
		const zodError = new ZodError(result.error.issues);
		const error = zodError.format();
		return new Response(error, { status: 400 });
	}

	const note = await noteResp.json();

	return new Response(JSON.stringify(note), { status: 200 });
};
