// import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
import { drizzle } from 'drizzle-orm/d1';
import type { D1Database } from '@cloudflare/workers-types';

// export const createDbSingleton = async () => {};

// function DbSingleton<SchemaType extends Record<string, string>>() {
// 	abstract class DbSingleton {
// 		static _db: DrizzleD1Database<SchemaType>;

// 		static initialize(database: D1Database, schema: SchemaType) {
// 			DbSingleton._db = drizzle(database, {
// 				schema,
// 				logger: false // set to true to log all queries
// 			});
// 		}
// 	}
// 	return DbSingleton;
// }

// export const createDbProxy = <SchemaType extends Record<string, string>>(db: D1Database, schema: SchemaType) => {

//   const dbSingletonInstance = DbSingleton<SchemaType>();
//   dbSingletonInstance.initialize(db, schema);

//   return new Proxy(dbSingletonInstance, {
//     get(target, prop, receiver) {
//       if (prop in target) {
//         return Reflect.get(target, prop, receiver);
//       }
//       if (dbSingletonInstance._db && prop in dbSingletonInstance._db) {
//         return dbSingletonInstance._db[prop as keyof typeof dbSingletonInstance._db];
//       }
//       return undefined;
//     }
//   }) as DrizzleD1Database<SchemaType>;
// };

export const createDbSingleton = <SchemaType extends Record<string, unknown>>(
	db: D1Database,
	schema: SchemaType
) => {
	return drizzle(db, {
		schema,
		logger: false
	});
};
