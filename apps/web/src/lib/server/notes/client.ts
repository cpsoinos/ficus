import { Bindings } from '$lib/server/bindings';
import { hc } from 'hono/client';
import type { NotesAppType } from '@ficus/service-notes/src/lib/notes/app';

export const getNotesClient = () => {
	return hc<NotesAppType>('https://ficus-notes.local', {
		fetch: Bindings.NOTES.fetch.bind(Bindings.NOTES)
	});
};
