<script lang="ts">
	import AuthForm from '$lib/components/auth-form.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	import type { PageProps } from './$types';

	let { form }: PageProps = $props();

	let errorMessage = $state('');
	let isUsingRecoveryCode = $state(false);

	let fields = $derived(isUsingRecoveryCode ? recoveryCodeField : authenticatorCodeField);

	$effect(() => {
		if (form?.totp?.message) {
			errorMessage = form.totp.message;
		} else if (form?.recoveryCode?.message) {
			errorMessage = form.recoveryCode.message;
		}
	});

	function clearFormError() {
		errorMessage = '';
	}
</script>

{#snippet authenticatorCodeField()}
	<div class="grid gap-2">
		<Label for="code">Code</Label>
		<Input
			id="code"
			type="text"
			name="code"
			required
			autocomplete="one-time-code"
			oninput={clearFormError}
		/>
	</div>
{/snippet}

{#snippet recoveryCodeField()}
	<div class="grid gap-2">
		<Label for="code">Recovery code</Label>
		<Input id="code" type="text" name="code" required autocomplete="off" oninput={clearFormError} />
	</div>
{/snippet}

<AuthForm
	method="POST"
	action={isUsingRecoveryCode ? '?/recovery_code' : '?/totp'}
	title="Two-factor authentication"
	description={isUsingRecoveryCode
		? 'Enter your recovery code.'
		: 'Enter the code from your authenticator app.'}
	{errorMessage}
	{fields}
>
	{#snippet footer()}
		<div class="grid w-full gap-4">
			<Button type="submit" class="w-full">Verify</Button>
			{#if isUsingRecoveryCode}
				<Button variant="outline" class="w-full" onclick={() => (isUsingRecoveryCode = false)}>
					Use authenticator code instead
				</Button>
			{:else}
				<Button variant="outline" class="w-full" onclick={() => (isUsingRecoveryCode = true)}>
					Use recovery code instead
				</Button>
			{/if}
		</div>
	{/snippet}
</AuthForm>
