import { loadIcons } from '@iconify/svelte';

const ICONS = [
	'lucide:arrow-left',
	'lucide:check',
	'lucide:chevron-right',
	'lucide:circle',
	'lucide:copy',
	'lucide:ellipsis',
	'lucide:minus',
	'lucide:panel-left',
	'lucide:plus',
	'lucide:search',
	'lucide:x',
	'mdi:github'
];

export async function preloadIcons() {
	try {
		return new Promise((resolve, reject) => {
			loadIcons(ICONS, (loaded, missing, pending) => {
				if (pending.length) {
					// Icons are pending, wait for all to load/fail
					//
					// If pending list is not empty, callback will be called
					// again when all icons are either loaded or missing
					return;
				}
				if (missing.length) {
					reject({
						loaded,
						missing
					});
				} else {
					resolve({
						loaded
					});
				}
			});
		});
	} catch (err) {
		console.error(err);
	}
	return Promise.resolve();
}
