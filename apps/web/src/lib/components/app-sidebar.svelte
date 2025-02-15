<script lang="ts" module>
	export interface SidebarItem {
		title: string;
		url: string;
		items?: SidebarItem[];
		isActive?: boolean;
	}
</script>

<script lang="ts">
	import SearchForm from './search-form.svelte';
	import * as Sidebar from './ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';

	let {
		ref = $bindable(null),
		sidebarItems,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & { sidebarItems: SidebarItem[] } = $props();
</script>

<Sidebar.Root {...restProps} bind:ref>
	<Sidebar.Header>
		<img src="/logo-light.svg" alt="Logo" class="h-12 w-12" />
		<SearchForm />
	</Sidebar.Header>
	<Sidebar.Content>
		<!-- We create a Sidebar.Group for each parent. -->
		{#each sidebarItems as group (group.title)}
			<Sidebar.Group>
				<Sidebar.GroupLabel>{group.title}</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each group.items ?? [] as item (item.title)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton isActive={item.isActive}>
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
