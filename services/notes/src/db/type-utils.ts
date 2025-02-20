import * as schema from './schema';

type ExtractPrefixes<T> = {
	[K in keyof T]: K extends `${infer Prefix}Table` ? Prefix : never;
}[keyof T];

export type ModelNames = ExtractPrefixes<typeof schema>;

export type ModelTable = (typeof schema)[`${ModelNames}Table`];

export type ModelType = (typeof schema)[`${ModelNames}Table`]['$inferSelect'];

export type ModelInsertType = (typeof schema)[`${ModelNames}Table`]['$inferInsert'];
