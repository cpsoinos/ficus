import { Bindings } from '$lib/server/bindings';

import type { RequestHandler } from './$types';

/**
 * Attach a file to a note
 *
 * Forwards the upload request to the SERVICE_ATTACHMENTS binding.
 * @note streaming file uploads are not supported by the Hono RPC client at this time
 *
 * Expects the following headers:
 *   - content-type: The content type of the file
 *   - x-file-name: The name of the file
 *
 * Sets the x-user-id header to the current user's ID.
 * Sets the x-note-id header to the note ID.
 */
export const POST: RequestHandler = async ({ locals, request, params }) => {
	const userId = locals.user?.id;
	if (!userId) {
		return new Response('Unauthorized', { status: 401 });
	}

	const noteId = params.noteId;

	const clonedRequest = request.clone();
	clonedRequest.headers.set('x-user-id', userId);
	clonedRequest.headers.set('x-note-id', noteId);

	const result = await Bindings.NOTES.fetch(
		'http://internal/attachments/upload',
		clonedRequest as Request
	);

	return new Response(await result.text());
};
