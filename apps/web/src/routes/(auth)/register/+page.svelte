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
	action="?/register"
	title="Register"
	description="Enter your email below to register for an account"
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
			<Button type="submit" class="w-full">Register</Button>
			<Button variant="outline" class="w-full" href="/oauth/github">Login with Github</Button>
			<div class="text-center text-sm">
				Already have an account?
				<a href="/login" class="underline">Sign in</a>
			</div>
		</div>
	{/snippet}
</AuthForm>
