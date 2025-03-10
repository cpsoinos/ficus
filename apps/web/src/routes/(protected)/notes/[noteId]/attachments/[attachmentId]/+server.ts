import { getAttachmentsClient } from '$lib/server/attachments/client';
import type { RequestHandler } from './$types';

/**
 * Stream an attachment to the client. Use for downloading files.
 */
export const GET: RequestHandler = async (event) => {
	const { user } = event.locals;
	const { attachmentId } = event.params;
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const attachmentsClient = getAttachmentsClient();
	const resp = await attachmentsClient[':attachmentId'].download.$get({
		param: { attachmentId },
		query: { userId: user.id }
	});

	return new Response(resp.body, {
		headers: resp.headers
	});
};
