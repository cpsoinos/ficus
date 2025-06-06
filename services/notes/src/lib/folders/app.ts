import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { listFolders } from './listFolders';

export const app = new Hono<{ Bindings: Env }>().get(
	'/',
	zValidator(
		'query',
		z.object({
			userId: z.string()
		})
	),
	async (c) => {
		const { userId } = c.req.valid('query');
		const notes = await listFolders(userId);
		return c.json(notes, 200);
	}
);

export type FoldersAppType = typeof app;
