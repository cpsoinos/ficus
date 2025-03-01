// import { Bindings } from '$lib/server/bindings';
// import type { NewNote } from '@ficus/service-notes/src/db/schema';
import type { RequestHandler } from './$types';

/**
 * Create a new note
 */
export const POST: RequestHandler = async ({ locals /* request */ }) => {
	const userId = locals.user?.id;
	if (!userId) {
		return new Response('Unauthorized', { status: 401 });
	}

	// const noteAttrs: NewNote = {
	// 	userId
	// };

	// return new Response(await result.text());
	return new Response('Not implemented', { status: 501 });
};
