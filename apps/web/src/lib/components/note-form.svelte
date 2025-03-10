<script lang="ts">
	import { Input } from './ui/input/index.js';
	import { Label } from './ui/label/index.js';
	import { Carta, MarkdownEditor } from 'carta-md';
	import { code } from '@cartamd/plugin-code';
	import { attachment } from '@cartamd/plugin-attachment';
	import { slash } from '@cartamd/plugin-slash';
	import 'carta-md/default.css';
	import '@cartamd/plugin-code/default.css';
	import '@cartamd/plugin-attachment/default.css';
	import '@cartamd/plugin-slash/default.css';
	import DOMPurify from 'isomorphic-dompurify';

	let {
		note = $bindable(),
		autoFocus,
		save
	}: {
		note: { title: string; content: string };
		autoFocus?: boolean;
		save: () => void | Promise<void>;
	} = $props();

	let title = $state<string>(note.title ?? '');
	let content = $state<string>(note.content ?? '');

	let attachments = $state<File[]>([]);

	const carta = new Carta({
		sanitizer: DOMPurify.sanitize,
		extensions: [
			code(),
			attachment({
				upload: async (file) => {
					attachments.push(file);
					return URL.createObjectURL(file);
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

	function debouncedSave() {
		debounce(save, 5000);
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
