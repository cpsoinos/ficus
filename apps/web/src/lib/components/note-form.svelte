<script lang="ts">
	import 'easymde/dist/easymde.min.css';
	import { marked } from 'marked';
	import EasyMDE from 'easymde';
	import { onMount } from 'svelte';

	let textarea: HTMLTextAreaElement;

	let editor = $state<EasyMDE>();
	let markdown = $state('');

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
				'ordered-list',
				'unordered-list'
			]
		});
		editor.codemirror.on('change', () => {
			markdown = editor!.value();
		});
	});
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
	<div class="rounded-lg border p-2">
		<textarea bind:this={textarea} class="hidden"></textarea>
	</div>
	<div class="rounded-lg border bg-gray-100 p-4">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<div class="preview">{@html marked(markdown)}</div>
	</div>
</div>
