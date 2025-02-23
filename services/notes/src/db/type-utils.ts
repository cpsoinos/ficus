import * as schema from './schema';

type ExtractPrefixes<T> = {
	[K in keyof T]: K extends `${infer Prefix}Table` ? Prefix : never;
}[keyof T];

export type ModelNames = ExtractPrefixes<typeof schema>;
