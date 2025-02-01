import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';
import { timestamps } from './util';
import { relations, type SQL, sql } from 'drizzle-orm';

export const user = sqliteTable('user', {
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

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	passwordResetSessions: many(passwordResetSession),
	emailVerificationRequests: many(emailVerificationRequest),
	oAuthAccounts: many(oAuthAccount)
}));

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	twoFactorVerified: integer('two_factor_verified', { mode: 'boolean' }).notNull().default(false)
});

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] })
}));

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;

export const passwordResetSession = sqliteTable('password_reset_session', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	email: text('email').notNull(),
	code: text('code').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
	twoFactorVerified: integer('two_factor_verified', { mode: 'boolean' }).notNull().default(false)
});

export const passwordResetSessionRelations = relations(passwordResetSession, ({ one }) => ({
	user: one(user, { fields: [passwordResetSession.userId], references: [user.id] })
}));

export type PasswordResetSession = typeof passwordResetSession.$inferSelect;
export type NewPasswordResetSession = typeof passwordResetSession.$inferInsert;

export const emailVerificationRequest = sqliteTable('email_verification_request', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	code: text('code').notNull(),
	email: text('email').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const emailVerificationRequestRelations = relations(emailVerificationRequest, ({ one }) => ({
	user: one(user, { fields: [emailVerificationRequest.userId], references: [user.id] })
}));

export type EmailVerificationRequest = typeof emailVerificationRequest.$inferSelect;
export type NewEmailVerificationRequest = typeof emailVerificationRequest.$inferInsert;

export const oAuthAccount = sqliteTable('oauth_account', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	provider: text('provider').notNull(),
	providerUserId: text('provider_user_id').notNull(),
	...timestamps
});

export const oAuthAccountRelations = relations(oAuthAccount, ({ one }) => ({
	user: one(user, { fields: [oAuthAccount.userId], references: [user.id] })
}));

export type OAuthAccount = typeof oAuthAccount.$inferSelect;
export type NewOAuthAccount = typeof oAuthAccount.$inferInsert;
