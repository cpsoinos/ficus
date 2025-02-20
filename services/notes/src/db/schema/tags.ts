import { timestamps } from '@ficus/common/db/timestamp-columns';
import { sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

export const tagsTable = sqliteTable(
	'tags',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text('user_id').notNull(),
		name: text('name').notNull(),
		...timestamps
	},
	(table) => [unique().on(table.userId, table.name)]
);

export type Tag = typeof tagsTable.$inferSelect;
export type NewTag = typeof tagsTable.$inferInsert;
