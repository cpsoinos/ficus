import { Hono } from '@hono/hono';

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.post('/upload', async (c) => {
	const contentType = c.req.header('content-type') || 'application/octet-stream';
	const filename = c.req.header('x-file-name') || `upload-${Date.now()}`;
	const userId = c.req.header('x-user-id');
	const path = `users/${userId}/${filename}`;

	try {
		const body = c.req.raw.body;
		if (!body) return c.text('No file uploaded', 400);

		const object = await c.env.R2.put(path, body, {
			httpMetadata: { contentType }
		});

		return c.json({ success: true, key: object.key });
	} catch (error) {
		return c.text(`Upload failed: ${error}`, 500);
	}
});

app.get('/download/:key', async (c) => {
	const key = c.req.param('key');
	if (!key) return c.text('No key provided', 400);

	try {
		const object = await c.env.R2.get(key);
		if (!object) return c.text('File not found', 404);

		return c.body(object.body);
	} catch (error) {
		return c.text(`Download failed: ${error}`, 500);
	}
});

export default app;
