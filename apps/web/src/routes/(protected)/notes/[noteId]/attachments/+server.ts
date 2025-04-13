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

	// Create a new Headers object with all original headers
	const newHeaders = new Headers(request.headers);
	// Add our custom headers
	newHeaders.set('x-user-id', userId);
	newHeaders.set('x-note-id', noteId);

	// Create a new Request with the same method, body and URL, but with the new headers
	const newRequest = new Request(request.url, {
		method: request.method,
		headers: newHeaders,
		body: request.body,
		duplex: 'half', // Add the required duplex option for streaming bodies
		// Preserve other properties if needed
		redirect: request.redirect,
		integrity: request.integrity,
		signal: request.signal
	});

	const result = await Bindings.NOTES.fetch('http://internal/attachments/upload', newRequest);

	return new Response(await result.text());
};
