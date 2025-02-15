import { usersTable } from './users';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm/relations';

export const emailVerificationRequestsTable = sqliteTable('email_verification_requests', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.notNull()
		.references(() => usersTable.id),
	code: text('code').notNull(),
	email: text('email').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const emailVerificationRequestRelations = relations(
	emailVerificationRequestsTable,
	({ one }) => ({
		user: one(usersTable, {
			fields: [emailVerificationRequestsTable.userId],
			references: [usersTable.id]
		})
	})
);

export type EmailVerificationRequest = typeof emailVerificationRequestsTable.$inferSelect;
export type NewEmailVerificationRequest = typeof emailVerificationRequestsTable.$inferInsert;
