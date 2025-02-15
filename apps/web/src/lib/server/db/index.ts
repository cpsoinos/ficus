import * as schema from './schema';
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';

type SchematizedDatabase = DrizzleD1Database<typeof schema>;

/**
 * Singleton for the database connection.
 *
 * Initialize this in `hooks.server.ts` with the database connection
 * so that it can be accessed from anywhere in the server code without
 * having to pass around the fetch event.
 */
export class DbSingleton {
	static _db: SchematizedDatabase;

	static initialize(database: D1Database) {
		DbSingleton._db = drizzle(database, {
			schema,
			logger: false // set to true to log all queries
		});
	}
}

type DbSingletonType = typeof DbSingleton & SchematizedDatabase;

/**
 * Syntax sugar for accessing the database singleton.
 */
export const db = new Proxy(DbSingleton, {
	get(target, prop, receiver) {
		if (prop in target) {
			return Reflect.get(target, prop, receiver);
		}
		if (DbSingleton._db && prop in DbSingleton._db) {
			return DbSingleton._db[prop as keyof typeof DbSingleton._db];
		}
		return undefined;
	}
}) as DbSingletonType;
