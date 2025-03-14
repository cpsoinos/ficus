<script lang="ts">
	import Icon from './ui/icon/icon.svelte';
	import { Label } from './ui/label/index.js';
	import * as Sidebar from './ui/sidebar/index.js';

	import type { WithElementRef } from 'bits-ui';
	import type { HTMLFormAttributes } from 'svelte/elements';

	let { ref = $bindable(null), ...restProps }: WithElementRef<HTMLFormAttributes> = $props();
</script>

<form bind:this={ref} {...restProps}>
	<Sidebar.Group class="py-0">
		<Sidebar.GroupContent class="relative">
			<Label for="search" class="sr-only">Search</Label>
			<Sidebar.Input id="search" placeholder="Search your notes..." class="pl-8" />
			<Icon
				icon="lucide:search"
				class="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50"
			/>
		</Sidebar.GroupContent>
	</Sidebar.Group>
</form>
