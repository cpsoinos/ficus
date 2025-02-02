<script lang="ts">
	import AuthWrapper from '$lib/components/auth-wrapper.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import type { PageProps } from './$types';
	import { fade } from 'svelte/transition';

	let { data }: PageProps = $props();

	let copied = $state(false);

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(data.recoveryCode);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch (err) {
			console.error('Failed to copy text:', err);
		}
	}
</script>

<AuthWrapper>
	<Card.Root class="mx-auto max-w-sm sm:w-96">
		<Card.Header>
			<Card.Title class="text-2xl" level={1}>Recovery code</Card.Title>
			<Card.Description>
				Your recovery code is used to recover your account if you lose access to your second
				factors.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid w-full gap-4">
				<div class="grid gap-2">
					<!-- <p>Your recovery code is: {data.recoveryCode}</p> -->
					<Label for="recovery-code">Your recovery code is:</Label>
					<div class="flex gap-2">
						<Input
							id="recovery-code"
							type="text"
							value={data.recoveryCode}
							readonly
							class="flex-1"
						/>
						<Button variant="outline" size="icon" onclick={copyToClipboard}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2-2a4 4 0 00-4 4v10a4 4 0 004 4h10a4 4 0 004-4V7a4 4 0 00-4-4H5z"
									clip-rule="evenodd"
								/>
							</svg>
						</Button>
					</div>
				</div>

				<div class="h-4">
					{#if copied}
						<p transition:fade class="text-center text-sm" aria-live="polite">
							Copied to clipboard!
						</p>
					{/if}
				</div>
			</div>
		</Card.Content>
		<Card.Footer>
			<div class="grid w-full gap-4">
				<Button type="button" href="/" class="w-full">Next</Button>
			</div>
		</Card.Footer>
	</Card.Root>
</AuthWrapper>
