<script lang="ts">
	import { attachment } from '@cartamd/plugin-attachment';
	import { code } from '@cartamd/plugin-code';
	import { slash } from '@cartamd/plugin-slash';
	import 'carta-md/default.css';
	import '@cartamd/plugin-code/default.css';
	import '@cartamd/plugin-attachment/default.css';
	import '@cartamd/plugin-slash/default.css';
	import { Carta, MarkdownEditor, type Plugin, type UnifiedTransformer } from 'carta-md';
	import DOMPurify from 'isomorphic-dompurify';
	import remarkFrontmatter from 'remark-frontmatter';
	import { toast } from 'svelte-sonner';

	import { uploadFile } from '$lib/uploadFile';

	import { Input } from './ui/input';
	import { Label } from './ui/label';

	import type { Attachment, NewNote } from '@ficus/service-notes/src/db/schema';

	let {
		note = $bindable(),
		autoFocus,
		save
	}: {
		note: Partial<NewNote>;
		autoFocus?: boolean;
		save: () => Promise<void>;
	} = $props();

	let title = $state<string>(note.title ?? '');
	let content = $state<string>(note.content ?? '');

	const frontmatter = (): Plugin => {
		const transformer: UnifiedTransformer<'sync'> = {
			execution: 'sync',
			type: 'remark',
			transform({ processor }) {
				processor.use(remarkFrontmatter);
			}
		};
		return {
			transformers: [transformer]
		};
	};

	const carta = new Carta({
		sanitizer: DOMPurify.sanitize,
		theme: {
			light: 'github-light',
			dark: 'github-dark'
		},
		extensions: [
			code(),
			attachment({
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
			slash(),
			frontmatter()
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
