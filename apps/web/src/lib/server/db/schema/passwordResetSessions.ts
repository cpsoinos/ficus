import { relations } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

import { usersTable } from './users';

export const passwordResetSessionsTable = sqliteTable('password_reset_sessions', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.notNull()
		.references(() => usersTable.id),
	email: text('email').notNull(),
	code: text('code').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
	twoFactorVerified: integer('two_factor_verified', { mode: 'boolean' }).notNull().default(false)
});

export const passwordResetSessionRelations = relations(passwordResetSessionsTable, ({ one }) => ({
	user: one(usersTable, {
		fields: [passwordResetSessionsTable.userId],
		references: [usersTable.id]
	})
}));

export type PasswordResetSession = typeof passwordResetSessionsTable.$inferSelect;
export type NewPasswordResetSession = typeof passwordResetSessionsTable.$inferInsert;
