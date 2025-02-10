import type { SidebarItem } from '$lib/components/app-sidebar.svelte';
import type { LayoutServerLoad } from './$types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const load: LayoutServerLoad = (_event) => {
	// probably fetch list of documents or folders or tags or something here
	const sidebarItems: SidebarItem[] = [
		{
			title: 'Getting Started',
			url: '#',
			items: [
				{
					title: 'Installation',
					url: '#'
				},
				{
					title: 'Project Structure',
					url: '#'
				}
			]
		},
		{
			title: 'Building Your Application',
			url: '#',
			items: [
				{
					title: 'Routing',
					url: '#'
				},
				{
					title: 'Data Fetching',
					url: '#',
					isActive: true
				},
				{
					title: 'Rendering',
					url: '#'
				},
				{
					title: 'Caching',
					url: '#'
				},
				{
					title: 'Styling',
					url: '#'
				},
				{
					title: 'Optimizing',
					url: '#'
				},
				{
					title: 'Configuring',
					url: '#'
				},
				{
					title: 'Testing',
					url: '#'
				},
				{
					title: 'Authentication',
					url: '#'
				},
				{
					title: 'Deploying',
					url: '#'
				},
				{
					title: 'Upgrading',
					url: '#'
				},
				{
					title: 'Examples',
					url: '#'
				}
			]
		},
		{
			title: 'API Reference',
			url: '#',
			items: [
				{
					title: 'Components',
					url: '#'
				},
				{
					title: 'File Conventions',
					url: '#'
				},
				{
					title: 'Functions',
					url: '#'
				},
				{
					title: 'next.config.js Options',
					url: '#'
				},
				{
					title: 'CLI',
					url: '#'
				},
				{
					title: 'Edge Runtime',
					url: '#'
				}
			]
		},
		{
			title: 'Architecture',
			url: '#',
			items: [
				{
					title: 'Accessibility',
					url: '#'
				},
				{
					title: 'Fast Refresh',
					url: '#'
				},
				{
					title: 'Svelte Compiler',
					url: '#'
				},
				{
					title: 'Supported Browsers',
					url: '#'
				},
				{
					title: 'Rollup',
					url: '#'
				}
			]
		}
	];

	return {
		sidebarItems
	};
};
