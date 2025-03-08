import { Bindings } from '$lib/server/bindings';
import { hc } from 'hono/client';
import type { AppType } from '@ficus/service-notes/src/lib/notes/app';

export const notesClient = hc<AppType>('https://ficus-notes.local', {
	fetch: Bindings.NOTES.fetch.bind(Bindings.NOTES)
});
