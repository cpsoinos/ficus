<script lang="ts">
	import NoteForm from '$lib/components/note-form.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';

	let note = $state({
		title: '',
		content: ''
	});

	let noteForm = $state<HTMLFormElement>();
	let submitButton = $derived<HTMLButtonElement | null | undefined>(
		noteForm?.querySelector('button[type="submit"]')
	);

	async function save() {
		Promise.resolve(noteForm?.requestSubmit.bind(noteForm)(submitButton));
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
	{#if browser}
		<NoteForm bind:note autoFocus {save} />
	{/if}
	<Button type="submit">Save</Button>
</form>
