<script lang="ts">
	import AuthForm from '$lib/components/auth-form.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import type { PageProps } from './$types';

	let { form, data }: PageProps = $props();

	let errorMessage = $state('');

	$effect(() => {
		if (form?.verify?.message) {
			errorMessage = form?.verify?.message;
		} else if (form?.resend?.message) {
			errorMessage = form?.resend?.message;
		}
	});

	function clearFormError() {
		errorMessage = '';
	}
</script>

<!-- <h1>Verify your email address</h1>
	<p>We sent an 8-digit code to {data.email}.</p>
	<form method="post" use:enhance action="?/verify">
		<label for="form-verify.code">Code</label>
		<input id="form-verify.code" name="code" required />
		<button>Verify</button>
		<p>{form?.verify?.message ?? ''}</p>
	</form>
	<form method="post" use:enhance action="?/resend">
		<button>Resend code</button>
		<p>{form?.resend?.message ?? ''}</p>
	</form>
	<a href="/settings">Change your email</a> -->
<AuthForm
	method="POST"
	action="?/verify"
	title="Verify your email address"
	description={`We sent an 8-digit code to ${data.email}.`}
	{errorMessage}
>
	{#snippet fields()}
		<div class="grid gap-2">
			<Label for="code">Code</Label>
			<Input
				id="code"
				type="text"
				name="code"
				required
				autocomplete="off"
				oninput={clearFormError}
			/>
		</div>
	{/snippet}

	{#snippet footer()}
		<div class="grid w-full gap-4">
			<Button type="submit" class="w-full">Verify</Button>
			<Button type="submit" class="w-full" formaction="?/resend" formnovalidate>Resend code</Button>
			<a href="/settings" class="text-center text-sm underline">Change your email</a>
		</div>
	{/snippet}
</AuthForm>
