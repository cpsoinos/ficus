import { hc } from 'hono/client';

import { Bindings } from './bindings';

import type { AttachmentsAppType } from '@ficus/service-notes/src/lib/attachments/app';
import type { FoldersAppType } from '@ficus/service-notes/src/lib/folders/app';
import type { NotesAppType } from '@ficus/service-notes/src/lib/notes/app';
import type { TagsAppType } from '@ficus/service-notes/src/lib/tags/app';

export const getNotesClient = () => {
	return hc<NotesAppType>('https://ficus-notes.local/notes', {
		fetch: Bindings.NOTES.fetch.bind(Bindings.NOTES)
	});
};

export const getAttachmentsClient = () => {
	return hc<AttachmentsAppType>('https://ficus-notes.local/attachments', {
		fetch: Bindings.NOTES.fetch.bind(Bindings.NOTES)
	});
};

export const getFoldersClient = () => {
	return hc<FoldersAppType>('https://ficus-notes.local/folders', {
		fetch: Bindings.NOTES.fetch.bind(Bindings.NOTES)
	});
};

export const getTagsClient = () => {
	return hc<TagsAppType>('https://ficus-notes.local/tags', {
		fetch: Bindings.NOTES.fetch.bind(Bindings.NOTES)
	});
};
