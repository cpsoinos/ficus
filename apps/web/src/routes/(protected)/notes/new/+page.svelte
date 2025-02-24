<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import NoteForm from '$lib/components/note-form.svelte';

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget as HTMLFormElement);
		const file = formData.get('file') as File;
		if (!file) return;

		try {
			const res = await uploadAttachment(file, (progress) => {
				console.log(`Upload Progress: ${progress}%`);
			});
			console.log('Upload Success:', res);
		} catch (err) {
			console.error('Upload Failed:', err);
		}
	}

	function uploadAttachment(file: File, onProgress: (progress: number) => void) {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open('POST', '/notes', true);
			xhr.setRequestHeader('X-File-Name', file.name);
			xhr.setRequestHeader('Content-Type', file.type);
			xhr.upload.onprogress = (event) => {
				if (event.lengthComputable) {
					const percent = Math.round((event.loaded / event.total) * 100);
					onProgress(percent);
				}
			};
			xhr.onload = () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					resolve(JSON.parse(xhr.responseText));
				} else {
					reject(new Error(`Upload failed with status ${xhr.status}`));
				}
			};
			xhr.onerror = () => reject(new Error('Upload error'));
			xhr.send(file);
		});
	}
</script>

<h1>New note</h1>
<NoteForm />

<form class="flex flex-col gap-4" onsubmit={handleSubmit}>
	<Label for="file">File</Label>
	<Input id="file" type="file" name="file" />
	<Button type="submit">Upload</Button>
</form>
