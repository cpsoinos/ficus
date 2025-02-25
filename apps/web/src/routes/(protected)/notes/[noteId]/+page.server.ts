import { Bindings } from '$lib/server/bindings';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { noteId } = event.params;

	using note = await Bindings.NOTES.findByIdWithAttachments(noteId);

	return { note };
};
