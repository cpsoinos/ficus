import { hc } from 'hono/client';

import { Bindings } from '$lib/server/bindings';

import type { FoldersAppType } from '@ficus/service-notes/src/lib/folders/app';

export const getFoldersClient = () => {
	return hc<FoldersAppType>('https://ficus-notes.local', {
		fetch: Bindings.FOLDERS.fetch.bind(Bindings.FOLDERS)
	});
};
