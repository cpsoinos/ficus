import { Bindings } from '$lib/server/bindings';
// import type { Note, Attachment } from '@ficus/service-notes/src/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { noteId } = event.params;

	const note = await Bindings.NOTES.findByIdWithAttachments(noteId);
	// const noteResp = await Bindings.NOTES.fetch(
	// 	`https://ficus-notes.local/notes/${noteId}?userId=${event.locals.user!.id}`
	// );
	// const note = await noteResp.json<Note & { attachments: Attachment[] }>();

	return { note };
};
