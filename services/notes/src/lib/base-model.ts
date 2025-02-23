import { WorkerEntrypointWithBindings } from './worker-entrypoint-with-bindings';
import * as schema from '../db/schema';
import { db } from '../db';
import { eq, getTableColumns } from 'drizzle-orm';
import type { ModelNames } from '../db/type-utils';
import type { SQLiteUpdateSetSource } from 'drizzle-orm/sqlite-core';

export abstract class BaseModel<T extends ModelNames> extends WorkerEntrypointWithBindings {
	private tableName: `${T}Table`;
	private table: (typeof schema)[`${T}Table`];

	constructor(ctx: ExecutionContext, env: Env, modelName: T) {
		super(ctx, env);
		this.tableName = `${modelName}Table`;
		this.table = schema[this.tableName];
	}

	async findById(id: string): Promise<(typeof schema)[`${T}Table`]['$inferSelect'] | undefined> {
		if (!this.tableHasIdColumn) {
			throw new Error(`Table ${this.tableName} does not have an 'id' column`);
		}
		const [result] = await db.select().from(this.table).where(eq(this.table.id, id));
		return result as (typeof schema)[`${T}Table`]['$inferSelect'] | undefined;
	}

	async findMany(userId: string): Promise<(typeof schema)[`${T}Table`]['$inferSelect'][]> {
		const results = await db.select().from(this.table).where(eq(this.table.userId, userId));
		return results as (typeof schema)[`${T}Table`]['$inferSelect'][];
	}

	async create(
		attrs: (typeof schema)[`${T}Table`]['$inferInsert']
	): Promise<(typeof schema)[`${T}Table`]['$inferSelect']> {
		const [result] = await db.insert(this.table).values(attrs).returning();
		return result as (typeof schema)[`${T}Table`]['$inferSelect'];
	}

	async update(
		id: string,
		attrs: SQLiteUpdateSetSource<(typeof schema)[`${T}Table`]>
	): Promise<(typeof schema)[`${T}Table`]['$inferSelect']> {
		if (!this.tableHasIdColumn) {
			throw new Error(`Table ${this.tableName} does not have an 'id' column`);
		}
		if (!attrs) {
			throw new Error('No attributes provided to update');
		}
		const [result] = await db
			.update(this.table)
			.set(attrs)
			.where(eq(this.table.id, id))
			.returning();
		return result;
	}

	async delete(id: string): Promise<void> {
		if (!this.tableHasIdColumn) {
			throw new Error(`Table ${this.tableName} does not have an 'id' column`);
		}
		await db.delete(this.table).where(eq(this.table.id, id));
	}

	private get tableHasIdColumn(): boolean {
		const tableColumns = getTableColumns(this.table);
		return 'id' in tableColumns;
	}
}
