<script lang="ts">
	import Icon, { getIcon } from '@iconify/svelte';
	import type { ComponentProps } from 'svelte';

	let { icon, ...rest }: ComponentProps<Icon> = $props();

	const preloadedIcon = $derived.by(() => {
		return typeof icon === 'string' ? getIcon(icon) : icon;
	});
</script>

{#if preloadedIcon}
	<Icon icon={preloadedIcon} role="presentation" {...rest} />
{:else}
	<Icon {icon} role="presentation" {...rest} />
{/if}
