<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const { note } = data;
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
