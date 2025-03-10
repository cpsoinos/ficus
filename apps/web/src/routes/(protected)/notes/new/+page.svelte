<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import NoteForm from '$lib/components/note-form.svelte';
	import { uploadFile } from '$lib/uploadFile';
	import { enhance } from '$app/forms';

	let note = $state({
		title: '',
		content: ''
	});

	let noteForm = $state<HTMLFormElement>();
	let submitButton = $derived<HTMLButtonElement | null | undefined>(
		noteForm?.querySelector('button[type="submit"]')
	);

	function save() {
		noteForm?.requestSubmit.bind(noteForm)(submitButton);
	}

	async function handleAttachmentsSubmit(event: SubmitEvent) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget as HTMLFormElement);
		const file = formData.get('file') as File;
		if (!file) return;

		try {
			const res = await uploadFile(file, '/notes', (progress) => {
				console.log(`Upload Progress: ${progress}%`);
			});
			console.log('Upload Success:', res);
		} catch (err) {
			console.error('Upload Failed:', err);
		}
	}
</script>

<h1>New note</h1>
<form
	class="flex flex-col gap-4"
	method="post"
	use:enhance
	bind:this={noteForm}
	data-sveltekit-keepfocus
>
	<NoteForm bind:note autoFocus {save} />
	<Button type="submit">Save</Button>
</form>

<form class="flex flex-col gap-4" onsubmit={handleAttachmentsSubmit}>
	<Label for="file">File</Label>
	<Input id="file" type="file" name="file" />
	<Button type="submit">Upload</Button>
</form>
