import { Bindings } from '$lib/server/bindings';
import type { RequestHandler } from './$types';

/**
 * Create a new note
 *
 * Forwards the upload request to the SERVICE_ATTACHMENTS binding.
 * Expects the following headers:
 *   - content-type: The content type of the file
 *   - x-file-name: The name of the file
 */
export const POST: RequestHandler = async (request) => {
	const result = await Bindings.SERVICE_ATTACHMENTS.fetch(
		'http://internal/upload',
		request.request
	);

	return new Response(await result.text());
};
