import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { listTags } from './listTags';

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
		const notes = await listTags(userId);
		return c.json(notes, 200);
	}
);

export type TagsAppType = typeof app;
