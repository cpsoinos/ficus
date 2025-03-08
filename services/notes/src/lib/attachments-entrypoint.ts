import { Bindings } from './bindings';
import { BaseModel } from './base-model';
import { attachmentsTable, type NewAttachment } from '../db/schema/attachments';
import { db } from '../db';
import { notesTable } from '../db/schema/notes';
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';

export class AttachmentsEntrypoint extends BaseModel<'attachments'> {
	// Need to use fetch handler for streaming file uploads at this time
	override fetch(req: Request) {
		return app.fetch(req);
	}

	async download(id: string): Promise<{
		fileName: string | undefined;
		body: ReadableStream;
		size: number;
		contentType: string | undefined;
	} | null> {
		try {
			const attachment = await db.query.attachmentsTable.findFirst({
				where: eq(attachmentsTable.id, id)
			});
			if (!attachment) return null;

			const object = await Bindings.R2.get(attachment.fileUrl);
			if (!object) return null;

			return {
				fileName: object.customMetadata?.filename,
				body: object.body,
				size: object.size,
				contentType: object.httpMetadata?.contentType
			};
		} catch (err) {
			console.error(err);
			return null;
		}
	}
}

const app = new Hono<{ Bindings: Env }>();

app.post('/upload', async (c) => {
	const contentType = c.req.header('content-type') || 'application/octet-stream';
	const fileName = c.req.header('x-file-name') || `upload-${Date.now()}`;
	const userId = c.req.header('x-user-id');
	let noteId = c.req.header('x-note-id');
	if (!userId) return c.text('No user id provided', 400);
	if (!fileName) return c.text('No file name provided', 400);

	try {
		const body = c.req.raw.body;
		if (!body) return c.text('No file uploaded', 400);

		const note = noteId
			? await db.query.notesTable.findFirst({ where: eq(notesTable.id, noteId) })
			: (await db.insert(notesTable).values({ userId, title: fileName }).returning())[0];

		noteId ||= note!.id;

		const attachmentId = crypto.randomUUID();

		const object = await Bindings.R2.put(`${userId}/${noteId}/${attachmentId}`, body, {
			httpMetadata: { contentType },
			customMetadata: { filename: fileName }
		});

		const attachmentRecord: NewAttachment = {
			id: attachmentId,
			noteId,
			userId,
			fileName,
			mimeType: contentType,
			fileUrl: object.key
		};

		const [attachment] = await db.insert(attachmentsTable).values(attachmentRecord).returning();

		return c.json(attachment);
	} catch (error) {
		console.error(error);
		return c.text(`Upload failed: ${error}`, 500);
	}
});
