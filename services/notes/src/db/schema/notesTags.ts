import { notesTable } from './notes';
import { tagsTable } from './tags';
import { relations } from 'drizzle-orm';
import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const notesTagsTable = sqliteTable(
	'notes_tags',
	{
		noteId: text('note_id')
			.notNull()
			.references(() => notesTable.id),
		tagId: text('tag_id')
			.notNull()
			.references(() => tagsTable.id)
	},
	(table) => [primaryKey({ columns: [table.noteId, table.tagId] })]
);

export const notesTagsRelations = relations(notesTagsTable, ({ one }) => ({
	tag: one(tagsTable, {
		fields: [notesTagsTable.tagId],
		references: [tagsTable.id]
	}),
	note: one(notesTable, {
		fields: [notesTagsTable.noteId],
		references: [notesTable.id]
	})
}));
