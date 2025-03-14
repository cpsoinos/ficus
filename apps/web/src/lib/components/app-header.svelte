<script module>
	export interface BreadcrumbPart {
		label: string;
		href?: string;
	}
</script>

<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';

	import * as Breadcrumb from './ui/breadcrumb/index.js';
	import { Button, buttonVariants } from './ui/button';
	import * as Drawer from './ui/drawer/index.js';
	import * as DropdownMenu from './ui/dropdown-menu';
	import { Separator } from './ui/separator/index.js';
	import SidebarTrigger from './ui/sidebar/sidebar-trigger.svelte';

	import { enhance } from '$app/forms';

	let {
		breadcrumbs
	}: {
		breadcrumbs: BreadcrumbPart[];
	} = $props();

	const ITEMS_TO_DISPLAY = 3;

	let open = $state(false);

	const isDesktop = new MediaQuery('(min-width: 768px)');
</script>

<header class="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
	<div class="flex items-center gap-2">
		<SidebarTrigger class="-ml-1" />
		<Separator orientation="vertical" class="mr-2 h-4" />
		<Breadcrumb.Root>
			<Breadcrumb.List>
				<Breadcrumb.Item>
					<Breadcrumb.Link href={breadcrumbs[0].href}>
						{breadcrumbs[0].label}
					</Breadcrumb.Link>
				</Breadcrumb.Item>
				<Breadcrumb.Separator />
				{#if breadcrumbs.length > ITEMS_TO_DISPLAY}
					<Breadcrumb.Item>
						{#if isDesktop.current}
							<DropdownMenu.Root bind:open>
								<DropdownMenu.Trigger class="flex items-center gap-1" aria-label="Toggle menu">
									<Breadcrumb.Ellipsis class="size-4" />
								</DropdownMenu.Trigger>
								<DropdownMenu.Content align="start">
									{#each breadcrumbs.slice(1, -2) as item}
										<DropdownMenu.Item>
											<a href={item.href ? item.href : '#'}>
												{item.label}
											</a>
										</DropdownMenu.Item>
									{/each}
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						{:else}
							<Drawer.Root bind:open>
								<Drawer.Trigger aria-label="Toggle Menu">
									<Breadcrumb.Ellipsis class="size-4" />
								</Drawer.Trigger>
								<Drawer.Content>
									<Drawer.Header class="text-left">
										<Drawer.Title>Navigate to</Drawer.Title>
										<Drawer.Description>Select a page to navigate to.</Drawer.Description>
									</Drawer.Header>
									<div class="grid gap-1 px-4">
										{#each breadcrumbs.slice(1, -2) as item}
											<a href={item.href ? item.href : '#'} class="py-1 text-sm">
												{item.label}
											</a>
										{/each}
									</div>
									<Drawer.Footer class="pt-4">
										<Drawer.Close class={buttonVariants({ variant: 'outline' })}>
											Close
										</Drawer.Close>
									</Drawer.Footer>
								</Drawer.Content>
							</Drawer.Root>
						{/if}
					</Breadcrumb.Item>
					<Breadcrumb.Separator />
				{/if}

				{#each breadcrumbs.slice(-ITEMS_TO_DISPLAY + 1) as item}
					<Breadcrumb.Item>
						{@const Component =
							!item.href || item === breadcrumbs[breadcrumbs.length - 1]
								? Breadcrumb.Page
								: Breadcrumb.Link}
						<Component href={item.href} class="max-w-20 truncate md:max-w-none">
							{item.label}
						</Component>
						{#if item !== breadcrumbs[breadcrumbs.length - 1]}
							<Breadcrumb.Separator />
						{/if}
					</Breadcrumb.Item>
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
