import { Bindings } from '$lib/server/bindings';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (request) => {
	const result = await Bindings.SERVICE_DOCUMENTS.fetch('http://internal/upload', request.request);

	return new Response(await result.text());
};
