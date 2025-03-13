<script lang="ts" module>
	export interface SidebarItem {
		title: string;
		url: string;
		items?: SidebarItem[];
	}
</script>

<script lang="ts">
	import SearchForm from './search-form.svelte';
	import { Button } from './ui/button/index.js';
	import * as Sidebar from './ui/sidebar/index.js';
	import Icon from './ui/icon/icon.svelte';
	import type { ComponentProps } from 'svelte';
	import { page } from '$app/state';

	let {
		ref = $bindable(null),
		sidebarItems,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & { sidebarItems: SidebarItem[] } = $props();

	let path = $derived(page.url.pathname);
</script>

<Sidebar.Root {...restProps} bind:ref>
	<Sidebar.Header>
		<img src="/logo-light.svg" alt="Logo" class="h-12 w-12" />
		<SearchForm />
		<Sidebar.Group class="pb-0 pt-4">
			<Sidebar.GroupContent class="relative">
				<Button href="/notes/new" size="sm" class="w-full">
					<Icon icon="lucide:plus" />
					New note
				</Button>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Header>
	<Sidebar.Content>
		<!-- We create a Sidebar.Group for each parent. -->
		{#each sidebarItems as group (group.title)}
			<Sidebar.Group>
				<Sidebar.GroupLabel>{group.title}</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each group.items ?? [] as item (item.title)}
							{@const isActive = path === item.url}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton {isActive}>
									{#snippet child({ props })}
										<a href={item.url} {...props}>{item.title}</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/each}
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
