<script lang="ts">
	import Header, { type BreadcrumbPart } from '$lib/components/app-header.svelte';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	import type { LayoutProps } from './$types';

	import { resolveRoute } from '$app/paths';
	import { page } from '$app/state';

	let { children, data }: LayoutProps = $props();
	const sidebarItems = $derived(data.sidebarItems);
	let route = $derived(page.route);

	const homeBreadcrumb = { label: 'Home', href: '/' };
	const notesBreadcrumb = { label: 'Notes', href: '/notes' };
	const newNoteBreadcrumb = { label: 'New', href: '/notes/new' };
	const noteBreadcrumb = $derived.by(() => {
		const note = sidebarItems
			.find((group) => group.title === 'Notes')
			?.items?.find((item) => item.id === page.params.noteId);
		return {
			label: note?.title ?? 'Note',
			...(page.params.noteId && { href: resolveRoute('/notes/[noteId]', page.params) })
		};
	});
	const editNoteBreadcrumb = $derived({
		label: 'Edit',
		...(page.params.noteId && { href: resolveRoute('/notes/[noteId]/edit', page.params) })
	});

	const PARTS_MAP: Record<string, BreadcrumbPart[]> = $derived({
		'/(protected)': [homeBreadcrumb],
		'/(protected)/notes': [homeBreadcrumb, notesBreadcrumb],
		'/(protected)/notes/new': [homeBreadcrumb, notesBreadcrumb, newNoteBreadcrumb],
		'/(protected)/notes/[noteId]': [homeBreadcrumb, notesBreadcrumb, noteBreadcrumb],
		'/(protected)/notes/[noteId]/edit': [
			homeBreadcrumb,
			notesBreadcrumb,
			noteBreadcrumb,
			editNoteBreadcrumb
		]
	});

	let breadcrumbs = $derived(PARTS_MAP[route.id!] ?? []);
</script>

<Sidebar.Provider>
	<AppSidebar {sidebarItems} />
	<Sidebar.Inset>
		<Header {breadcrumbs} />
		<div class="flex flex-1 flex-col gap-4 p-4">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
