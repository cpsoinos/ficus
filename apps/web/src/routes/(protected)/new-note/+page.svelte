<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	function uploadFile(file: File, onProgress: (progress: number) => void) {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			xhr.open('POST', '/new-note', true);
			xhr.setRequestHeader('X-File-Name', file.name);
			xhr.setRequestHeader('Content-Type', file.type);

			// Track progress
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

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget as HTMLFormElement);
		const file = formData.get('file') as File;
		if (!file) return;

		uploadFile(file, (progress) => {
			console.log(`Upload Progress: ${progress}%`);
		})
			.then((res) => console.log('Upload Success:', res))
			.catch((err) => console.error('Upload Failed:', err));
	}
</script>

<h1>Upload a Document</h1>
<form class="flex flex-col gap-4" onsubmit={handleSubmit}>
	<Label for="file">File</Label>
	<Input id="file" type="file" name="file" />
	<Button type="submit">Upload</Button>
</form>
