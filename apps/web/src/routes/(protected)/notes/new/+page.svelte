<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import NoteForm from '$lib/components/note-form.svelte';
	import { enhance } from '$app/forms';

	let note = $state({
		title: '',
		content: ''
	});

	let noteForm = $state<HTMLFormElement>();
	let submitButton = $derived<HTMLButtonElement | null | undefined>(
		noteForm?.querySelector('button[type="submit"]')
	);

	function save() {
		noteForm?.requestSubmit.bind(noteForm)(submitButton);
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
	<NoteForm bind:note autoFocus {save} />
	<Button type="submit">Save</Button>
</form>
