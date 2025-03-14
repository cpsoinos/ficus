import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { downloadAttachment } from './downloadAttachment';
import { uploadAttachment } from './uploadAttachment';

export const app = new Hono<{ Bindings: Env }>();

// note: the Hono RPC client does not support file uploads at this time,
// so we use a standard HTTP POST request to handle file uploads
app.post('/upload', async (c) => {
	const contentType = c.req.header('content-type') || 'application/octet-stream';
	const fileName = c.req.header('x-file-name') || `upload-${Date.now()}`;
	const userId = c.req.header('x-user-id');
	const noteId = c.req.header('x-note-id');
	const body = c.req.raw.body;

	if (!userId) return c.text('No user id provided', 400);
	if (!fileName) return c.text('No file name provided', 400);
	if (!body) return c.text('No file uploaded', 400);

	try {
		const attachment = await uploadAttachment({
			contentType,
			fileName,
			userId,
			noteId,
			body
		});
		return c.json(attachment, 201);
	} catch (err) {
		console.error(err);
		return c.text(`Upload failed: ${err}`, 500);
	}
});

const _route = app.get(
	'/:attachmentId/download',
	zValidator('query', z.object({ userId: z.string().uuid() })),
	async (c) => {
		const attachmentId = c.req.param('attachmentId');
		const { userId } = c.req.valid('query');

		const attachment = await downloadAttachment({ attachmentId, userId });
		if (!attachment) return c.text('Attachment not found', 404);

		c.header('Content-Type', attachment.contentType);
		c.header('Content-Length', String(attachment.size));
		c.header('Content-Disposition', `attachment; filename="${attachment.fileName}"`);

		return c.body(attachment.body);
	}
);

export type AttachmentsAppType = typeof _route;
