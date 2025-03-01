import { Bindings } from '$lib/server/bindings';
import type { SidebarItem } from '$lib/components/app-sidebar.svelte';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const { user } = event.locals;
	const userId = user!.id;

	const [notesList, foldersList] = await Promise.all([
		Bindings.NOTES.listNotes(userId),
		Bindings.FOLDERS.listFolders(userId)
	]);

	const sidebarItems: SidebarItem[] = [
		{
			title: 'Notes',
			url: '#',
			items: notesList.map((note) => {
				return {
					title: note.title,
					url: `/notes/${note.id}`
				};
			})
		},
		...foldersList.map((folder) => {
			return {
				title: folder.name,
				url: `/folders/${folder.id}`,
				items: folder.subFolders.map((subFolder) => {
					return {
						title: subFolder.name,
						url: `/folders/${subFolder.id}`
					};
				})
			};
		})
	];

	return {
		sidebarItems
	};
};
