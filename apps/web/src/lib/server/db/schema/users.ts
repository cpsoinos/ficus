import { timestamps } from '@ficus/common/db/timestamp-columns';
import { type SQL, sql, relations } from 'drizzle-orm';
import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';

import { emailVerificationRequestsTable } from './emailVerificationRequests';
import { oAuthAccountsTable } from './oAuthAccounts';
import { passwordResetSessionsTable } from './passwordResetSessions';
import { sessionsTable } from './sessions';

export const usersTable = sqliteTable('users', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	email: text('email').notNull().unique(),
	name: text('name'),
	passwordHash: text('password_hash'),
	emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
	totpKey: blob('totp_key', { mode: 'buffer' }).$type<Uint8Array>(),
	registered2FA: integer('registered_2fa', { mode: 'boolean' }).generatedAlwaysAs(
		(): SQL => sql`IIF(totp_key IS NOT NULL, 1, 0)`,
		{ mode: 'virtual' }
	),
	recoveryCode: blob('recovery_code', { mode: 'buffer' }).$type<Uint8Array>().notNull(),
	...timestamps
});

export const userRelations = relations(usersTable, ({ many }) => ({
	sessions: many(sessionsTable),
	passwordResetSessions: many(passwordResetSessionsTable),
	emailVerificationRequests: many(emailVerificationRequestsTable),
	oAuthAccounts: many(oAuthAccountsTable)
}));

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
