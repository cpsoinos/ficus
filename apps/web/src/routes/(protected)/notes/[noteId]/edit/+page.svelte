<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import NoteForm from '$lib/components/note-form.client.svelte';
	import Icon from '$lib/components/ui/icon/icon.svelte';
	import type { PageProps } from './$types';
	import type { Note } from '@ficus/service-notes/src/db/schema/notes';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';

	let { data }: PageProps = $props();

	const noteId = $derived(page.params.noteId);

	let note = $state({
		...data.note,
		title: data.note?.title ?? '',
		content: data.note?.content ?? ''
	});

	let noteForm = $state<HTMLFormElement>();

	async function saveNote() {
		const formData = new FormData(noteForm);
		const resp = await fetch(`/notes/${noteId}/edit`, {
			method: 'PUT',
			body: formData
		});
		if (resp.ok) {
			const updatedNote = await resp.json<Note>();
			note = {
				...updatedNote,
				content: updatedNote.content ?? ''
			};
		} else {
			console.error('Failed to save note');
		}
	}
</script>

{#if !note}
	Note not found
{:else}
	<div>
		<!-- TODO: replace with breadcrumb usage -->
		<Button variant="link" class="p-0" href={`/notes/${note.id}`} size="sm">
			<Icon icon="lucide:arrow-left" />
			Back
		</Button>
	</div>
	<form
		class="flex flex-col gap-4"
		method="post"
		action="?/update"
		use:enhance
		bind:this={noteForm}
		data-sveltekit-keepfocus
	>
		<NoteForm bind:note autoFocus save={saveNote} />
		<Button type="submit">Save</Button>
	</form>

	<form class="flex flex-col gap-4" method="post" action="?/delete" use:enhance>
		<Button type="submit" variant="destructive">Delete note</Button>
	</form>
{/if}
