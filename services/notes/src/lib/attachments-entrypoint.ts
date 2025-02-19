import { BaseModel } from './base-model';
import { Hono } from '@hono/hono';
import type { NewAttachment } from '../db/schema/attachments';

export class AttachmentsEntrypoint extends BaseModel {
	app = new Hono<{ Bindings: CloudflareBindings }>();

	constructor(ctx: ExecutionContext, env: CloudflareBindings) {
		super(ctx, env, 'attachments');

		this.app.post('/upload', async (c) => {
			const contentType = c.req.header('content-type') || 'application/octet-stream';
			const fileName = c.req.header('x-file-name') || `upload-${Date.now()}`;
			const userId = c.req.header('x-user-id');
			const noteId = c.req.header('x-note-id');
			const path = `users/${userId}/${fileName}`;

			if (!userId) return c.text('No user id provided', 400);

			try {
				const body = c.req.raw.body;
				if (!body) return c.text('No file uploaded', 400);

				// if note id, save the attachment to the note
				if (noteId) {
					// const attachment = await c.env.Attachments.createAttachment({ noteId, userId });
				}

				// const attachment: NewAttachment = {
				// 	userId
				// };

				const object = await c.env.R2.put(path, body, {
					httpMetadata: { contentType }
				});

				const attachmentRecord: NewAttachment = {
					noteId,
					userId,
					fileName,
					mimeType: contentType,
					fileUrl: object.key
				};

				const attachment = await this.create(attachmentRecord);

				return c.json(attachment);
			} catch (error) {
				return c.text(`Upload failed: ${error}`, 500);
			}
		});

		this.app.get('/download/:key', async (c) => {
			const key = c.req.param('key');
			if (!key) return c.text('No key provided', 400);

			try {
				const object = await c.env.R2.get(key);
				if (!object) return c.text('File not found', 404);

				return c.body(object.body);
			} catch (error) {
				return c.text(`Download failed: ${error}`, 500);
			}
		});
	}

	override fetch = this.app.fetch.bind(this.app);
}
