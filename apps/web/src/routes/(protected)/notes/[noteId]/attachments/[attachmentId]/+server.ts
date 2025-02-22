import { Bindings } from '$lib/server/bindings';

export const GET = async (event) => {
	const { user } = event.locals;
	const { noteId, attachmentId } = event.params;
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const key = `${user.id}/${noteId}/${attachmentId}`;
	console.log('🚀 ~ GET ~ key:', key);

	const attachment = await Bindings.ATTACHMENTS.download(key);
	if (!attachment) {
		return new Response('Attachment not found', { status: 404 });
	}

	return new Response(attachment.body as unknown as ReadableStream, {
		headers: {
			'Content-Type': attachment.contentType!,
			'Content-Length': String(attachment.size),
			'Content-Disposition': `attachment; filename="${attachment.filename}"`
		}
	});
};
