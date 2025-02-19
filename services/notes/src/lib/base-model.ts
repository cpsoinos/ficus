import { WorkerEntrypointWithBindings } from './worker-entrypoint-with-bindings';
import * as schema from '../db/schema';
import { db } from '../db';
import { eq, getTableColumns } from 'drizzle-orm';
import type { ModelInsertType, ModelNames, ModelTable, ModelType } from '../db/type-utils';

export abstract class BaseModel extends WorkerEntrypointWithBindings {
	private tableName: `${ModelNames}Table`;
	private table: ModelTable;

	constructor(ctx: ExecutionContext, env: CloudflareBindings, modelName: ModelNames) {
		super(ctx, env);
		this.tableName = `${modelName}Table`;
		this.table = schema[this.tableName];
	}

	findById = async (id: string): Promise<ModelType | undefined> => {
		if (!this.tableHasIdColumn) {
			throw new Error(`Table ${this.tableName} does not have an 'id' column`);
		}
		const [result] = await db.select().from(this.table).where(eq(this.table.id, id));
		return result;
	};

	findMany = async (userId: string): Promise<ModelType[]> => {
		const results = await db.select().from(this.table).where(eq(this.table.userId, userId));
		return results;
	};

	create = async (attrs: ModelInsertType): Promise<ModelType> => {
		const [result] = await db.insert(this.table).values(attrs).returning();
		return result;
	};

	update = async (id: string, attrs: Partial<ModelInsertType>): Promise<ModelType> => {
		if (!this.tableHasIdColumn) {
			throw new Error(`Table ${this.tableName} does not have an 'id' column`);
		}
		const [result] = await db
			.update(this.table)
			.set(attrs)
			.where(eq(this.table.id, id))
			.returning();
		return result;
	};

	delete = async (id: string): Promise<void> => {
		if (!this.tableHasIdColumn) {
			throw new Error(`Table ${this.tableName} does not have an 'id' column`);
		}
		await db.delete(this.table).where(eq(this.table.id, id));
	};

	private get tableHasIdColumn(): boolean {
		const tableColumns = getTableColumns(this.table);
		return 'id' in tableColumns;
	}
}
