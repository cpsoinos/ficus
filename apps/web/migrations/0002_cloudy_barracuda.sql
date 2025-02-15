CREATE TABLE `email_verification_request`(
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `code` text NOT NULL,
  `email` text NOT NULL,
  `expires_at` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE NO action ON DELETE NO action
);

--> statement-breakpoint
CREATE TABLE `password_reset_session`(
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `email` text NOT NULL,
  `code` text NOT NULL,
  `expires_at` integer NOT NULL,
  `email_verified` integer DEFAULT FALSE NOT NULL,
  `two_factor_verified` integer DEFAULT FALSE NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE NO action ON DELETE NO action
);

--> statement-breakpoint
ALTER TABLE `session`
  ADD `two_factor_verified` integer DEFAULT FALSE NOT NULL;

--> statement-breakpoint
ALTER TABLE `user`
  ADD `email_verified` integer DEFAULT FALSE NOT NULL;

--> statement-breakpoint
ALTER TABLE `user`
  ADD `totp_key` blob;

--> statement-breakpoint
ALTER TABLE `user`
  ADD `registered_2fa` integer GENERATED ALWAYS AS (IIF(totp_key IS NOT NULL, 1, 0)) VIRTUAL;

--> statement-breakpoint
ALTER TABLE `user`
  ADD `recovery_code` blob NOT NULL;
