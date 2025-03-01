export default {
	async fetch() {
		return new Response('Use named entrypoints', { status: 404 });
	}
} satisfies ExportedHandler<Env>;

export { NotesEntrypoint } from './lib/notes/entrypoint';
export { FoldersEntrypoint } from './lib/folders-entrypoint';
export { TagsEntrypoint } from './lib/tags-entrypoint';
export { AttachmentsEntrypoint } from './lib/attachments-entrypoint';
