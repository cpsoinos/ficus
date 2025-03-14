import rehypeShiki from '@shikijs/rehype';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import { getNotesClient } from '$lib/server/notes/client';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { user } = event.locals;
	if (!user) {
		return { status: 401, error: 'Unauthorized' };
	}

	const { noteId } = event.params;
	const notesClient = getNotesClient();

	const noteResp = await notesClient.findByIdWithAttachments.$get({
		query: { noteId, userId: user.id }
	});

	if (noteResp.status === 404) {
		return { status: 404, error: 'Note not found' };
	}

	if (noteResp.ok) {
		const note = await noteResp.json();
		const file = await unified()
			.use(remarkParse)
			.use(remarkFrontmatter)
			.use(remarkGfm)
			.use(remarkRehype)
			.use(rehypeSanitize)
			.use(rehypeStringify)
			.use(rehypeShiki, {
				themes: {
					light: 'github-light',
					dark: 'github-dark'
				}
			})
			.process(note.content ?? '');
		const html = file.toString();

		return { note, html };
	}

	return { status: 500, error: 'Failed to load note' };
};
