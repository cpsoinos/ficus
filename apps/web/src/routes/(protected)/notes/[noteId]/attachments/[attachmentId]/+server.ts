import { Bindings } from '$lib/server/bindings';

export const GET = async (event) => {
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
