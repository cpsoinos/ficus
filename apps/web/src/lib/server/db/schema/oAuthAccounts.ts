import type { OAuthProvider } from '$lib/server/oauth';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { usersTable } from './users';
import { relations } from 'drizzle-orm/relations';
import { timestamps } from '../util';

export const oAuthAccountsTable = sqliteTable('oauth_accounts', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.notNull()
		.references(() => usersTable.id),
	provider: text('provider').notNull().$type<OAuthProvider>(),
	providerUserId: text('provider_user_id').notNull(),
	...timestamps
});

export const oAuthAccountRelations = relations(oAuthAccountsTable, ({ one }) => ({
	user: one(usersTable, { fields: [oAuthAccountsTable.userId], references: [usersTable.id] })
}));

export type OAuthAccount = typeof oAuthAccountsTable.$inferSelect;
export type NewOAuthAccount = typeof oAuthAccountsTable.$inferInsert;
