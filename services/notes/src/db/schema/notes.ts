import { foldersTable } from './folders';
import { timestamps } from '@ficus/common/db/timestamp-columns';
import { relations } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const notesTable = sqliteTable('notes', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id').notNull(),
	folderId: text('folder_id').references(() => foldersTable.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	content: text('content'),
	...timestamps
});

export const noteRelations = relations(notesTable, ({ one }) => ({
	folder: one(foldersTable, { fields: [notesTable.folderId], references: [foldersTable.id] })
}));

export type Note = typeof notesTable.$inferSelect;
export type NewNote = typeof notesTable.$inferInsert;
