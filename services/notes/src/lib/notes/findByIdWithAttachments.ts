import { db } from '../../db';
import { notesTable, type Attachment, type Note } from '../../db/schema';
import { eq } from 'drizzle-orm';

export async function findByIdWithAttachments(
	noteId: string
): Promise<(Note & { attachments: Attachment[] }) | undefined> {
	return db.query.notesTable.findFirst({
		where: eq(notesTable.id, noteId),
		with: {
			attachments: true
		}
	});
}
