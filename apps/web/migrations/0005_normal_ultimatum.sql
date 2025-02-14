DROP TABLE IF EXISTS `sessions`;

CREATE TABLE `sessions`(
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `expires_at` integer NOT NULL,
  `two_factor_verified` integer DEFAULT FALSE NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES "users"(`id`) ON UPDATE NO action ON DELETE NO action
);

DROP TABLE IF EXISTS `password_reset_sessions`;

CREATE TABLE `password_reset_sessions`(
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `email` text NOT NULL,
  `code` text NOT NULL,
  `expires_at` integer NOT NULL,
  `email_verified` integer DEFAULT FALSE NOT NULL,
  `two_factor_verified` integer DEFAULT FALSE NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES "users"(`id`) ON UPDATE NO action ON DELETE NO action
);

DROP TABLE IF EXISTS `email_verification_requests`;

CREATE TABLE `email_verification_requests`(
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `code` text NOT NULL,
  `email` text NOT NULL,
  `expires_at` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES "users"(`id`) ON UPDATE NO action ON DELETE NO action
);

DROP TABLE IF EXISTS `oauth_accounts`;

CREATE TABLE `oauth_accounts`(
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `provider` text NOT NULL,
  `provider_user_id` text NOT NULL,
  `created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  `updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES "users"(`id`) ON UPDATE NO action ON DELETE NO action
);
