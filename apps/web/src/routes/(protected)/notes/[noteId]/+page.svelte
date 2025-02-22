<script lang="ts">
	// import { Button } from '$lib/components/ui/button';
	import type { PageProps } from './$types';
	// import { page } from '$app/state';

	const { data }: PageProps = $props();
	const { note } = data;
	console.log(note);

	// const { noteId } = page.params;

	// 	const regExpFilename = /filename="(?<filename>.*)"/;

	// 	// TODO: get filename from page data, then implement download without using object url intermediary

	// 	async function download() {
	// 		const res = await fetch(`/notes/${id}/attachment`);
	// 		const blob = await res.blob();
	// 		const filename: string | null =
	// 			regExpFilename.exec(res.headers.get('Content-Disposition')!)?.groups?.filename ?? null;
	// 		const url = URL.createObjectURL(blob);
	// 		const a = document.createElement('a');
	// 		a.href = url;
	// 		a.download = filename ?? 'attachment';
	// 		a.click();
	// 		URL.revokeObjectURL(url);
	// 	}
	//
</script>

<h1>Attachment</h1>
<!-- <Button onclick={download}>Download attachment</Button> -->
<!-- <Button href={`/notes/${id}/attachment`} download={attachment.filename}>Fetch attachment</Button> -->
