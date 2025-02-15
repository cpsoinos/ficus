<script lang="ts">
	import { useSidebar } from './context.svelte.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import Icon from '$lib/components/ui/icon/icon.svelte';
	import type { ComponentProps } from 'svelte';

	let {
		ref = $bindable(null),
		class: className,
		onclick,
		...restProps
	}: ComponentProps<typeof Button> & {
		onclick?: (e: MouseEvent) => void;
	} = $props();

	const sidebar = useSidebar();
</script>

<Button
	type="button"
	onclick={(e) => {
		onclick?.(e);
		sidebar.toggle();
	}}
	data-sidebar="trigger"
	variant="ghost"
	size="icon"
	class={cn('h-7 w-7', className)}
	{...restProps}
>
	<Icon icon="lucide:panel-left" />
	<span class="sr-only">Toggle Sidebar</span>
</Button>
