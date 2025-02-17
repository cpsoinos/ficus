import { notesTable } from './notes';
import { timestamps } from '@ficus/common/db/timestamp-columns';
import { relations } from 'drizzle-orm';
import { foreignKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const foldersTable = sqliteTable(
	'folders',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text('user_id').notNull(),
		parentFolderId: text('parent_folder_id'),
		name: text('name').notNull(),
		...timestamps
	},
	(table) => [
		foreignKey({
			name: 'parent_folder_fk',
			columns: [table.parentFolderId],
			foreignColumns: [table.id]
		}).onDelete('cascade')
	]
);

export const folderRelations = relations(foldersTable, ({ one, many }) => ({
	parentFolder: one(foldersTable, {
		fields: [foldersTable.parentFolderId],
		references: [foldersTable.id],
		relationName: 'parentFolder'
	}),
	subFolders: many(foldersTable, {
		relationName: 'subFolders'
	}),
	notes: many(notesTable)
}));

export type Folder = typeof foldersTable.$inferSelect;
export type NewFolder = typeof foldersTable.$inferInsert;
