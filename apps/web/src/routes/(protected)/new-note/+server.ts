import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (request) => {
	const result = await fetch('http://localhost:8765/upload', request.request);

	return new Response(await result.text());
};
