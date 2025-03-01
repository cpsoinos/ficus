import { Bindings } from '$lib/server/bindings';
import type { RequestHandler } from './$types';

/**
 * Attach a file to a note
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

	const clonedRequest = request.clone();
	clonedRequest.headers.set('x-user-id', userId);
	const result = await Bindings.ATTACHMENTS.fetch(
		'http://internal/upload',
		clonedRequest as Request
	);

	return new Response(await result.text());
};

export const GET: RequestHandler = async (event) => {
	const { user } = event.locals;
	const { attachmentId } = event.params;
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}

	using downloadedAttachment = await Bindings.ATTACHMENTS.download(attachmentId);

	if (!downloadedAttachment) {
		return new Response('Object not found', { status: 404 });
	}

	return new Response(downloadedAttachment.body as unknown as ReadableStream, {
		headers: {
			'Content-Type': downloadedAttachment.contentType!,
			'Content-Length': String(downloadedAttachment.size),
			'Content-Disposition': `attachment; filename="${downloadedAttachment.fileName}"`
		}
	});
};
