import { timestamps } from '@ficus/common/db/timestamp-columns';
import { relations } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { notesTable } from './notes';

export const attachmentsTable = sqliteTable('attachments', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id').notNull(),
	noteId: text('note_id')
		.notNull()
		.references(() => notesTable.id, { onDelete: 'cascade' }),
	fileName: text('file_name').notNull(),
	mimeType: text('mime_type').notNull(),
	fileUrl: text('file_url').notNull(),
	...timestamps
});

export const attachmentRelations = relations(attachmentsTable, ({ one }) => ({
	note: one(notesTable, { fields: [attachmentsTable.noteId], references: [notesTable.id] })
}));

export type Attachment = typeof attachmentsTable.$inferSelect;
export type NewAttachment = typeof attachmentsTable.$inferInsert;
