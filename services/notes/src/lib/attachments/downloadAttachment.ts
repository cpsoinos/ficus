import { Bindings } from '../bindings';
import { db } from '../../db';
import { and, eq } from 'drizzle-orm';

export async function downloadAttachment({
	attachmentId,
	userId
}: {
	attachmentId: string;
	userId: string;
}): Promise<{
	fileName: string;
	body: ReadableStream;
	size: number;
	contentType: string;
} | null> {
	try {
		const attachment = await db.query.attachmentsTable.findFirst({
			where: (table) => and(eq(table.userId, userId), eq(table.id, attachmentId))
		});
		if (!attachment) return null;

		const object = await Bindings.R2.get(attachment.fileUrl);
		if (!object) return null;

		return {
			fileName: attachment.fileName,
			body: object.body,
			size: object.size,
			contentType: attachment.mimeType
		};
	} catch (err) {
		console.error(err);
		return null;
	}
}
