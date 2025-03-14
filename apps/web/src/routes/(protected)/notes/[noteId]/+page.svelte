<script lang="ts">
	import { PreRendered } from 'carta-md';

	import { Button } from '$lib/components/ui/button';

	import type { PageProps } from './$types';
	import 'carta-md/default.css';
	import '@cartamd/plugin-code/default.css';
	import '@cartamd/plugin-attachment/default.css';
	import '@cartamd/plugin-slash/default.css';

	let { data }: PageProps = $props();
	const { note, html } = $derived(data);
</script>

{#if !note}
	<h1>Not found</h1>
{:else}
	<div class="flex items-center justify-between">
		<h1>{note.title}</h1>
		<Button variant="outline" href={`/notes/${note.id}/edit`}>Edit</Button>
	</div>

	<PreRendered {html} />

	{#if note.attachments.length}
		{#each note.attachments as attachment}
			<div class="flex items-center justify-between">
				<p>Attachment: {attachment.fileName}</p>
				<Button
					href={`/notes/${note.id}/attachments/${attachment.id}`}
					download={attachment.fileName}>Download</Button
				>
			</div>
		{/each}
	{/if}
{/if}
