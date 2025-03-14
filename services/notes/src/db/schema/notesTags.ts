import { relations } from 'drizzle-orm';
import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { notesTable } from './notes';
import { tagsTable } from './tags';

export const notesTagsTableJoin = sqliteTable(
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

export const notesTagsRelations = relations(notesTagsTableJoin, ({ one }) => ({
	tag: one(tagsTable, {
		fields: [notesTagsTableJoin.tagId],
		references: [tagsTable.id]
	}),
	note: one(notesTable, {
		fields: [notesTagsTableJoin.noteId],
		references: [notesTable.id]
	})
}));
