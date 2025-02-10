<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLLiAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';
	import Icon from '$lib/components/ui/icon/icon.svelte';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLLiAttributes> = $props();
</script>

<li
	role="presentation"
	aria-hidden="true"
	class={cn('[&>svg]:size-3.5', className)}
	bind:this={ref}
	{...restProps}
>
	{#if children}
		{@render children?.()}
	{:else}
		<Icon icon="lucide:chevron-right" />
	{/if}
</li>
