<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { PageProps } from './$types';
	// import { page } from '$app/state';

	let { data }: PageProps = $props();
	const { note } = data;

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

{#if !note}
	<h1>Not found</h1>
{:else}
	<h1>{note.title}</h1>
	<p>{note.content}</p>
	{#if note.attachments.length}
		{#each note.attachments as attachment}
			<div class="flex justify-between">
				<p>Attachment: {attachment.fileName}</p>
				<Button
					href={`/notes/${note.id}/attachments/${attachment.id}`}
					download={attachment.fileName}>Download</Button
				>
			</div>
		{/each}
	{/if}
{/if}
<!-- <Button onclick={download}>Download attachment</Button> -->
<!-- <Button href={`/notes/${id}/attachment`} download={attachment.filename}>Fetch attachment</Button> -->
