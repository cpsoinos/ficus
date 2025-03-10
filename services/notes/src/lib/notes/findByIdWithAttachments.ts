import { db } from '../../db';
import { and, eq } from 'drizzle-orm';
import type { Attachment, Note } from '../../db/schema';

export async function findByIdWithAttachments({
	noteId,
	userId
}: {
	noteId: string;
	userId: string;
}): Promise<(Note & { attachments: Attachment[] }) | undefined> {
	return db.query.notesTable.findFirst({
		where: (table) => and(eq(table.id, noteId), eq(table.userId, userId)),
		with: {
			attachments: true
		}
	});
}
