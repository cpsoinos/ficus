import { relations } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { usersTable } from './users';

export const sessionsTable = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => usersTable.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	twoFactorVerified: integer('two_factor_verified', { mode: 'boolean' }).notNull().default(false)
});

export const sessionRelations = relations(sessionsTable, ({ one }) => ({
	user: one(usersTable, { fields: [sessionsTable.userId], references: [usersTable.id] })
}));

export type Session = typeof sessionsTable.$inferSelect;
export type NewSession = typeof sessionsTable.$inferInsert;
