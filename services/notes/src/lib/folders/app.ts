import { listFolders } from './listFolders';
import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

export const app = new Hono<{ Bindings: Env }>();

const _route = app.get(
	'/list',
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

export type FoldersAppType = typeof _route;
