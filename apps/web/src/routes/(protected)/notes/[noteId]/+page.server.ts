import { Bindings } from '$lib/server/bindings';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { noteId } = event.params;

	const note = await Bindings.NOTES.findById(noteId);
	if (!note) {
		return { status: 404 };
	}

	return { note };
};
