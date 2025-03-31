import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { downloadAttachment } from './downloadAttachment';
import { uploadAttachment } from './uploadAttachment';

export const app = new Hono<{ Bindings: Env }>()
	.post(
		'/upload',
		zValidator(
			'header',
			z.object({
				'x-file-name': z.string(),
				'x-user-id': z.string().uuid(),
				'x-note-id': z.string().uuid(),
				'content-type': z.string()
			})
		),
		async (c) => {
			const {
				'x-file-name': fileName,
				'x-user-id': userId,
				'x-note-id': noteId,
				'content-type': contentType
			} = c.req.valid('header');

			const body = c.req.raw.body;

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
		}
	)
	.get(
		'/:attachmentId/download',
		zValidator('query', z.object({ userId: z.string().uuid(), download: z.boolean().optional() })),
		async (c) => {
			const attachmentId = c.req.param('attachmentId');
			const { userId, download } = c.req.valid('query');

			const attachment = await downloadAttachment({ attachmentId, userId });
			if (!attachment) return c.text('Attachment not found', 404);

			c.header('Content-Type', attachment.contentType);
			c.header('Content-Length', String(attachment.size));
			if (download) {
				c.header('Content-Disposition', `attachment; filename="${attachment.fileName}"`);
			}

			return c.body(attachment.body);
		}
	);

export type AttachmentsAppType = typeof app;
