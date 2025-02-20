import * as schema from './schema';
import { Bindings } from './bindings';
import { createDbSingleton } from '@ficus/common/db/db-singleton';

export const db = createDbSingleton<typeof schema>(Bindings.DB, schema);
