// import { WorkerEntrypoint } from 'cloudflare:workers';
// export default class extends WorkerEntrypoint<CloudflareBindings> {
// 	// constructor(ctx: ExecutionContext, env: CloudflareBindings) {
// 	// 	super(ctx, env);
// 	// 	BindingsSingleton.initialize(env);
// 	// }
// }

import { app } from './lib/attachments-entrypoint';

export default app;

export { NotesEntrypoint } from './lib/notes-entrypoint';
export { FoldersEntrypoint } from './lib/folders-entrypoint';
export { TagsEntrypoint } from './lib/tags-entrypoint';
export { AttachmentsEntrypoint } from './lib/attachments-entrypoint';
