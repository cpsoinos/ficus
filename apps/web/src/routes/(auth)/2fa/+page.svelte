<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label/index.js';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<form method="post" use:enhance>
	<Card.Root class="mx-auto max-w-sm sm:w-96">
		<Card.Header>
			<Card.Title class="text-2xl">Two-factor authentication</Card.Title>
			<Card.Description>Enter the code from your authenticator app.</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-4">
				<div class="grid gap-2">
					<Label for="form-totp.code">Code</Label>
					<Input id="form-totp.code" name="code" required autocomplete="one-time-code" />
				</div>

				<div class="h-4">
					{#if form?.message}
						<p class="text-sm text-red-500">{form.message}</p>
					{/if}
				</div>

				<Button type="submit" class="w-full">Verify</Button>
			</div>
			<div class="mt-4 text-center text-sm">
				<a href="/2fa/reset" class="underline">Use recovery code</a>
			</div>
		</Card.Content>
	</Card.Root>
</form>
