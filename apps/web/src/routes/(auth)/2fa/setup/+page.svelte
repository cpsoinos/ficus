<script lang="ts">
	import AuthForm from '$lib/components/auth-form.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import type { PageProps } from './$types';

	let { form, data }: PageProps = $props();

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
	title="Secure your account"
	description="Scan the QR code with your authenticator app and enter the one-time code below."
	{errorMessage}
>
	{#snippet fields()}
		<div class="mx-auto pb-2">
			<div class="size-52">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html data.qrcode}
			</div>
		</div>
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
		<input name="key" value={data.encodedTOTPKey} hidden required />
	{/snippet}

	{#snippet footer()}
		<div class="grid w-full gap-4">
			<Button type="submit" class="w-full">Continue</Button>
		</div>
	{/snippet}
</AuthForm>
