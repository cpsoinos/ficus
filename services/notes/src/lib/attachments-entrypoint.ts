import { WorkerEntrypointWithBindings } from './worker-entrypoint-with-bindings';
import { attachmentsTable, type NewAttachment } from '../db/schema/attachments';
import { db } from '../db';
import { notesTable } from '../db/schema/notes';
import { Hono } from '@hono/hono';
import { eq } from 'drizzle-orm';

export class AttachmentsEntrypoint extends WorkerEntrypointWithBindings {
	// async upload({
	// 	userId,
	// 	noteId,
	// 	fileName,
	// 	contentType,
	// 	contentLength,
	// 	body
	// }: {
	// 	userId: string;
	// 	noteId?: string;
	// 	fileName: string;
	// 	contentType: string;
	// 	contentLength?: number;
	// 	body: ReadableStream<Uint8Array>;
	// }) {
	async upload(request: Request) {
		const contentType = request.headers.get('content-type') || 'application/octet-stream';
		const fileName = request.headers.get('x-file-name') || `upload-${Date.now()}`;
		const userId = request.headers.get('x-user-id');
		let noteId = request.headers.get('x-note-id');
		if (!userId) return 'No user id provided';

		try {
			const note = noteId
				? await db.query.notesTable.findFirst({ where: eq(notesTable.id, noteId) })
				: (await db.insert(notesTable).values({ userId, title: fileName }).returning())[0];

			noteId ||= note!.id;

			const path = `users/${userId}/${fileName}`;
			const object = await this.env.R2.put(path, request.body, {
				httpMetadata: { contentType }
			});

			const attachmentRecord: NewAttachment = {
				noteId,
				userId,
				fileName,
				mimeType: contentType,
				fileUrl: object.key
			};

			const [attachment] = await db.insert(attachmentsTable).values(attachmentRecord).returning();

			return attachment;
		} catch (error) {
			return `Upload failed: ${error}`;
		}
	}

	// override fetch(req: Request) {
	// 	return this.app.fetch(req);
	// }
}

export const app = new Hono<{ Bindings: CloudflareBindings }>();

app.post('/upload', async (c) => {
	const contentType = c.req.header('content-type') || 'application/octet-stream';
	const fileName = c.req.header('x-file-name') || `upload-${Date.now()}`;
	const userId = c.req.header('x-user-id');
	let noteId = c.req.header('x-note-id');
	const path = `users/${userId}/${fileName}`;

	if (!userId) return c.text('No user id provided', 400);

	try {
		const body = c.req.raw.body;
		if (!body) return c.text('No file uploaded', 400);

		const note = noteId
			? await db.query.notesTable.findFirst({ where: eq(notesTable.id, noteId) })
			: (await db.insert(notesTable).values({ userId, title: fileName }).returning())[0];

		noteId ||= note!.id;

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

		const [attachment] = await db.insert(attachmentsTable).values(attachmentRecord).returning();

		return c.json(attachment);
	} catch (error) {
		return c.text(`Upload failed: ${error}`, 500);
	}
});

app.get('/download/:key', async (c) => {
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
