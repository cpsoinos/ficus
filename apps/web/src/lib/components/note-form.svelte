<script lang="ts">
	import 'easymde/dist/easymde.min.css';
	import 'github-markdown-css/github-markdown-light.css';
	import * as Tabs from './ui/tabs/index.js';
	import { marked } from 'marked';
	import EasyMDE from 'easymde';
	import { onMount } from 'svelte';

	let textarea: HTMLTextAreaElement;

	let editor = $state<EasyMDE>();
	let markdown = $state('');

	// let attachments = $state<File[]>([]);

	onMount(() => {
		editor = new EasyMDE({
			element: textarea,
			spellChecker: false,
			toolbar: [
				'bold',
				'italic',
				'heading',
				'|',
				'quote',
				'code',
				'link',
				'image',
				'ordered-list',
				'unordered-list',
				'|',
				'guide'
			]
			// uploadImage: true
			// imageUploadFunction(file, onSuccess, onError) {
			// 	attachments.push(file);
			// 	const previewUrl = URL.createObjectURL(file);
			// 	console.log('previewUrl:', previewUrl);
			// 	onSuccess(previewUrl);
			// 	onError('Failed to preview image');
			// 	// URL.revokeObjectURL(previewUrl);
			// }
			// imageMaxSize: 1024 * 1024 * 10,
			// imagesPreviewHandler: function (data, container) {
			//   container.innerHTML = '';
			//   const image = document.createElement('img');
			//   image.src = data.url;
			//   container.appendChild(image);
			// },
		});
		editor.codemirror.on('change', () => {
			markdown = editor!.value();
		});
	});
</script>

<Tabs.Root value="editor" class="w-full">
	<Tabs.List>
		<Tabs.Trigger value="editor">Edit</Tabs.Trigger>
		<Tabs.Trigger value="preview">Preview</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="editor">
		<textarea bind:this={textarea} class="hidden"></textarea>
	</Tabs.Content>
	<Tabs.Content value="preview">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<div class="markdown-body">{@html marked(markdown)}</div>
	</Tabs.Content>
</Tabs.Root>
