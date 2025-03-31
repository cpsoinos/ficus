<script lang="ts">
	import NoteForm from '$lib/components/note-form.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import Icon from '$lib/components/ui/icon/icon.svelte';

	import type { PageProps } from './$types';
	import type { NoteWithContent } from '@ficus/service-notes/src/lib/notes/types';

	import { browser } from '$app/environment';
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
			const updatedNote = await resp.json<NoteWithContent>();
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
		{#if browser}
			<NoteForm bind:note autoFocus save={saveNote} />
		{/if}
	</form>

	<AlertDialog.Root>
		<AlertDialog.Trigger class={buttonVariants({ variant: 'destructive' })} type="button">
			Delete note
		</AlertDialog.Trigger>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
				<AlertDialog.Description>
					This action cannot be undone. This will permanently delete your note.
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
				<form class="flex flex-col gap-4" method="post" action="?/delete" use:enhance>
					<AlertDialog.Action type="submit">Continue</AlertDialog.Action>
				</form>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
{/if}
