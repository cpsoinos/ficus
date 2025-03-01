<script lang="ts">
	import { Carta, MarkdownEditor } from 'carta-md';
	import { code } from '@cartamd/plugin-code';
	import { attachment } from '@cartamd/plugin-attachment';
	import { slash } from '@cartamd/plugin-slash';
	import 'carta-md/default.css';
	import '@cartamd/plugin-code/default.css';
	import '@cartamd/plugin-attachment/default.css';
	import '@cartamd/plugin-slash/default.css';
	import DOMPurify from 'isomorphic-dompurify';

	let markdown = $state('');

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

	// let timer: ReturnType<typeof setTimeout>;

	// const debounce = (value: string) => {
	// 	clearTimeout(timer);
	// 	timer = setTimeout(() => {
	// 		val = value;
	// 	}, 750);
	// }
</script>

<MarkdownEditor {carta} bind:value={markdown} />

<style lang="postcss">
	:global(.carta-toolbar) {
		height: 2.5rem !important;
	}

	:global(.carta-toolbar-left button) {
		padding-top: 0.5rem;
	}
</style>
