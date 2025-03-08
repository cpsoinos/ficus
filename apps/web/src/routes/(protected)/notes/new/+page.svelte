<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import NoteForm from '$lib/components/note-form.svelte';
	import { uploadFile } from '$lib/file-upload';
	import { enhance } from '$app/forms';

	async function handleSubmit(event: SubmitEvent) {
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
<form use:enhance method="post">
	<NoteForm />
	<Button type="submit">Save</Button>
</form>

<form class="flex flex-col gap-4" onsubmit={handleSubmit}>
	<Label for="file">File</Label>
	<Input id="file" type="file" name="file" />
	<Button type="submit">Upload</Button>
</form>
