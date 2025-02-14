ALTER TABLE USER RENAME TO users;

--> statement-breakpoint
ALTER TABLE session RENAME TO sessions;

--> statement-breakpoint
ALTER TABLE password_reset_session RENAME TO password_reset_sessions;

--> statement-breakpoint
ALTER TABLE email_verification_request RENAME TO email_verification_requests;

--> statement-breakpoint
ALTER TABLE oauth_account RENAME TO oauth_accounts;

--> statement-breakpoint
