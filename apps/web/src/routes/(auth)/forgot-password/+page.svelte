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
	title="Forgot your password?"
	description="Enter your email below to reset your password"
	{errorMessage}
>
	{#snippet fields()}
		<div class="grid gap-2">
			<Label for="email">Email</Label>
			<Input
				id="email"
				type="email"
				name="email"
				placeholder="m@example.com"
				required
				autocomplete="username"
				value={form?.email}
				oninput={clearFormError}
			/>
		</div>
	{/snippet}

	{#snippet footer()}
		<div class="grid w-full gap-4">
			<Button type="submit" class="w-full">Send</Button>
			<a href="/login" class="text-center text-sm underline">Sign in</a>
		</div>
	{/snippet}
</AuthForm>
