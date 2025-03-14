<script module>
	export interface BreadcrumbPart {
		label: string;
		url: string;
	}
</script>

<script lang="ts">
	import * as DropdownMenu from './ui/dropdown-menu';
	import { Button } from './ui/button';
	import * as Breadcrumb from './ui/breadcrumb/index.js';
	import { Separator } from './ui/separator/index.js';
	import SidebarTrigger from './ui/sidebar/sidebar-trigger.svelte';
	import { enhance } from '$app/forms';

	let {
		breadcrumbs
	}: {
		breadcrumbs: BreadcrumbPart[];
	} = $props();
</script>

<header class="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
	<div class="flex items-center gap-2">
		<SidebarTrigger class="-ml-1" />
		<Separator orientation="vertical" class="mr-2 h-4" />
		<Breadcrumb.Root>
			<Breadcrumb.List>
				{#each breadcrumbs as { label, url }, i (label)}
					<Breadcrumb.Item>
						{@const Component = i === breadcrumbs.length - 1 ? Breadcrumb.Page : Breadcrumb.Link}
						<Component href={url}>
							{label}
						</Component>
					</Breadcrumb.Item>
					{#if i < breadcrumbs.length - 1}
						<Breadcrumb.Separator />
					{/if}
				{/each}
			</Breadcrumb.List>
		</Breadcrumb.Root>
	</div>

	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="outline" size="icon" class="overflow-hidden rounded-full">
					<img
						src="/images/placeholder-user.jpg"
						width={36}
						height={36}
						alt="Avatar"
						class="overflow-hidden rounded-full"
					/>
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end">
			<DropdownMenu.Label>My account</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.Item>
				{#snippet child({ props })}
					<a href="/settings" {...props}>Settings</a>
				{/snippet}
			</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item>
				{#snippet child({ props })}
					<form method="post" action="/?/logout" use:enhance {...props}>
						<button>Sign out</button>
					</form>
				{/snippet}
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</header>
