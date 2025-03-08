import { foldersTable } from './folders';
import { attachmentsTable } from './attachments';
import { timestamps } from '@ficus/common/db/timestamp-columns';
import { relations } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createSelectSchema, createInsertSchema, createUpdateSchema } from 'drizzle-zod';

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

export const noteRelations = relations(notesTable, ({ one, many }) => ({
	folder: one(foldersTable, { fields: [notesTable.folderId], references: [foldersTable.id] }),
	attachments: many(attachmentsTable)
}));

export type Note = typeof notesTable.$inferSelect;
export type NewNote = typeof notesTable.$inferInsert;

export const noteSelectSchema = createSelectSchema(notesTable);
export const noteInsertSchema = createInsertSchema(notesTable);
export const noteUpdateSchema = createUpdateSchema(notesTable);
