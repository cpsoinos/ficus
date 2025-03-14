import { hc } from 'hono/client';

import { Bindings } from '$lib/server/bindings';

import type { AttachmentsAppType } from '@ficus/service-notes/src/lib/attachments/app';

export const getAttachmentsClient = () => {
	return hc<AttachmentsAppType>('https://ficus-notes.local', {
		fetch: Bindings.ATTACHMENTS.fetch.bind(Bindings.ATTACHMENTS)
	});
};
