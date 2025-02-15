import { Hono } from '@hono/hono';

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.post('/upload', async (c) => {
	const contentType = c.req.header('content-type') || 'application/octet-stream';
	const filename = c.req.header('x-file-name') || `upload-${Date.now()}`;

	try {
		const body = c.req.raw.body;
		if (!body) return c.text('No file uploaded', 400);

		const object = await c.env.R2.put(filename, body, {
			httpMetadata: { contentType }
		});

		return c.json({ success: true, key: object.key });
	} catch (error) {
		return c.text(`Upload failed: ${error}`, 500);
	}
});

export default app;
