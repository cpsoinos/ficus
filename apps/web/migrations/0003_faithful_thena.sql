PRAGMA foreign_keys = OFF;

ALTER TABLE users RENAME TO _users_old;

CREATE TABLE `users`(
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL,
  `name` text,
  `password_hash` text,
  `email_verified` integer DEFAULT FALSE NOT NULL,
  `totp_key` blob,
  `registered_2fa` integer GENERATED ALWAYS AS (IIF(totp_key IS NOT NULL, 1, 0)) VIRTUAL,
  `recovery_code` blob NOT NULL,
  `created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  `updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);

INSERT INTO users(id, email, name, password_hash, email_verified, totp_key, recovery_code, created_at, updated_at)
SELECT
  id,
  email,
  name,
  password_hash,
  email_verified,
  totp_key,
  recovery_code,
  created_at,
  updated_at
FROM
  _users_old;

PRAGMA foreign_keys = ON;
