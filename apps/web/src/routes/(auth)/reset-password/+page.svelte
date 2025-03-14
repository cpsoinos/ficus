<script lang="ts">
	import AuthForm from '$lib/components/auth-form.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	import type { PageProps } from './$types';

	let { form }: PageProps = $props();

	let errorMessage = $state('');

	$effect(() => {
		if (form?.message) {
			errorMessage = form.message;
		}
	});

	function clearFormError() {
		errorMessage = '';
	}
</script>

<AuthForm
	method="POST"
	title="Reset password"
	description="Enter your new password below."
	{errorMessage}
>
	{#snippet fields()}
		<div class="grid gap-2">
			<Label for="password">Password</Label>
			<Input
				id="password"
				type="password"
				name="password"
				required
				autocomplete="new-password"
				oninput={clearFormError}
			/>
		</div>
	{/snippet}

	{#snippet footer()}
		<div class="grid w-full gap-4">
			<Button type="submit" class="w-full">Reset password</Button>
		</div>
	{/snippet}
</AuthForm>
