<script lang="ts">
	import AuthWrapper from '$lib/components/auth-wrapper.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import Icon from '$lib/components/ui/icon/icon.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import type { PageProps } from './$types';
	import { fade } from 'svelte/transition';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

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

						<Tooltip.Provider>
							<Tooltip.Root>
								<Tooltip.Trigger>
									<Button variant="outline" size="icon" onclick={copyToClipboard}>
										<Icon icon="lucide:copy" />
									</Button>
								</Tooltip.Trigger>
								<Tooltip.Content>Copy to clipboard</Tooltip.Content>
							</Tooltip.Root>
						</Tooltip.Provider>
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
