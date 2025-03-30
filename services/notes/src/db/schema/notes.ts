import { timestamps } from '@ficus/common/db/timestamp-columns';
import { relations } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

import { attachmentsTable } from './attachments';
import { foldersTable } from './folders';

export const notesTable = sqliteTable('notes', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id', { mode: 'text' }).notNull(),
	folderId: text('folder_id').references(() => foldersTable.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	...timestamps
});

export const noteRelations = relations(notesTable, ({ one, many }) => ({
	folder: one(foldersTable, { fields: [notesTable.folderId], references: [foldersTable.id] }),
	attachments: many(attachmentsTable)
}));

export type Note = typeof notesTable.$inferSelect;
export type NewNote = typeof notesTable.$inferInsert;

export const noteInsertSchema = createInsertSchema(notesTable).extend({
	content: z.string().optional()
});
export const noteUpdateSchema = createUpdateSchema(notesTable).extend({
	content: z.string().optional()
});
