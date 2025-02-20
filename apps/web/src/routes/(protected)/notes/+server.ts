import { Bindings } from '$lib/server/bindings';
import type { RequestHandler } from './$types';

/**
 * Create a new note
 *
 * Forwards the upload request to the SERVICE_ATTACHMENTS binding.
 * Expects the following headers:
 *   - content-type: The content type of the file
 *   - x-file-name: The name of the file
 *
 * Sets the x-user-id header to the current user's ID.
 */
export const POST: RequestHandler = async ({ locals, request }) => {
	const userId = locals.user?.id;
	if (!userId) {
		return new Response('Unauthorized', { status: 401 });
	}

	const headers = new Headers(request.headers);
	headers.set('x-user-id', userId);

	const forwardedRequest = new Request('http://internal/upload', {
		method: 'POST',
		headers,
		body: request.body
	});

	const result = await Bindings.UPLOADS.fetch('http://internal/upload', forwardedRequest);
	// const result = await Bindings.ATTACHMENTS.upload({
	// 	contentType: request.headers.get('content-type') || 'application/octet-stream',
	// 	fileName: request.headers.get('x-file-name') || `upload-${Date.now()}`,
	// 	userId,
	// 	body: request.body!
	// });
	// const result = await Bindings.ATTACHMENTS.upload(forwardedRequest);

	return new Response(await result.text());
	// return new Response(JSON.stringify(result));
};
