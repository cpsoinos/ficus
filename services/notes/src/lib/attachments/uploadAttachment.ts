import { db } from '../../db';
import { notesTable } from '../../db/schema';
import { attachmentsTable, type Attachment, type NewAttachment } from '../../db/schema/attachments';
import { Bindings } from '../bindings';
import { eq } from 'drizzle-orm';

export async function uploadAttachment({
	contentType,
	fileName,
	userId,
	noteId,
	body
}: {
	contentType: string;
	fileName: string;
	userId: string;
	noteId?: string;
	body: ReadableStream;
}): Promise<Attachment> {
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

	return attachment;
}
