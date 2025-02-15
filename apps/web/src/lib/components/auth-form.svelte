<script lang="ts">
	import * as Card from './ui/card/index.js';
	import type { Snippet } from 'svelte';
	import type { SvelteHTMLElements } from 'svelte/elements';
	import { enhance } from '$app/forms';

	let {
		title,
		description,
		fields,
		errorMessage,
		footer,
		...rest
	}: {
		title: string;
		description: string;
		fields: Snippet;
		errorMessage?: string;
		footer: Snippet;
	} & SvelteHTMLElements['form'] = $props();
</script>

<form use:enhance {...rest}>
	<Card.Root class="mx-auto max-w-sm sm:w-96">
		<Card.Header>
			<Card.Title class="text-2xl" level={1}>{title}</Card.Title>
			<Card.Description>{description}</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid w-full gap-4">
				{@render fields?.()}
				<div class="h-4">
					{#if errorMessage}
						<p class="text-center text-sm text-red-500" aria-live="polite">{errorMessage}</p>
					{/if}
				</div>
			</div>
		</Card.Content>
		<Card.Footer>
			{@render footer?.()}
		</Card.Footer>
	</Card.Root>
</form>
