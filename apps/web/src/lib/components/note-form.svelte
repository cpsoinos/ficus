<script lang="ts">
	import { attachment } from '@cartamd/plugin-attachment';
	import { code } from '@cartamd/plugin-code';
	import { slash } from '@cartamd/plugin-slash';
	import 'carta-md/default.css';
	import '@cartamd/plugin-code/default.css';
	import '@cartamd/plugin-attachment/default.css';
	import '@cartamd/plugin-slash/default.css';
	import {
		DEFAULT_EDITOR_THEME__DARK,
		DEFAULT_EDITOR_THEME__LIGHT,
		DEFAULT_HIGHLIGHTER_THEME
	} from '@ficus/common/markdown/constants';
	import { Carta, MarkdownEditor } from 'carta-md';
	import DOMPurify from 'isomorphic-dompurify';
	import { toast } from 'svelte-sonner';

	import { uploadFile } from '$lib/uploadFile';

	import { Input } from './ui/input';
	import { Label } from './ui/label';

	import type { Attachment } from '@ficus/service-notes/src/db/schema';
	import type { NewNoteWithContent } from '@ficus/service-notes/src/lib/notes/types';

	let {
		note = $bindable(),
		autoFocus,
		save
	}: {
		note: Partial<NewNoteWithContent>;
		autoFocus?: boolean;
		save: () => Promise<void>;
	} = $props();

	let title = $state<string>(note.title ?? '');
	let content = $state<string>(note.content ?? '');

	const carta = new Carta({
		sanitizer: DOMPurify.sanitize,
		// editor themes
		theme: {
			light: DEFAULT_EDITOR_THEME__LIGHT,
			dark: DEFAULT_EDITOR_THEME__DARK
		},
		shikiOptions: {
			// load theme for rendering code blocks
			themes: [DEFAULT_HIGHLIGHTER_THEME]
		},
		extensions: [
			code({
				// rendered code block themes
				theme: DEFAULT_HIGHLIGHTER_THEME
			}),
			attachment({
				supportedMimeTypes: [
					'image/png',
					'image/jpeg',
					'image/gif',
					'image/svg+xml',
					'application/pdf'
				],
				upload: async (file) => {
					if (!note.id) {
						throw new Error('Note must be saved before uploading attachments');
					}
					const attachment = await uploadFile<Attachment>(
						file,
						`/notes/${note.id}/attachments`,
						(progress) => {
							console.log(`Upload Progress: ${progress}%`);
						}
					);
					// force save after attachment upload
					debouncedSave();
					return `/notes/${note.id}/attachments/${attachment.id}`;
				}
			}),
			slash()
		]
	});

	let timer: ReturnType<typeof setTimeout>;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const debounce = <CallbackType extends (...args: any[]) => any>(
		cb: CallbackType,
		timeout: number
	) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			cb();
		}, timeout);
	};

	async function saveAndToast() {
		toast.promise(save, {
			loading: 'Saving…',
			success: 'Note saved',
			error: 'Failed to save note'
		});
	}

	function debouncedSave() {
		debounce(saveAndToast, 3000);
	}
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-col gap-2">
		<Label for="title">Title</Label>
		<Input id="title" type="text" name="title" bind:value={title} onchange={save} />
	</div>

	<MarkdownEditor
		{carta}
		bind:value={content}
		textarea={{ autoFocus, name: 'content', oninput: debouncedSave }}
	/>
</div>

<style lang="postcss">
	:global(.carta-toolbar) {
		height: 2.5rem !important;
	}

	:global(.carta-toolbar-left button) {
		padding-top: 0.5rem;
	}
</style>
