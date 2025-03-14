import { getFoldersClient } from '$lib/server/folders/client';
import { getNotesClient } from '$lib/server/notes/client';

import type { SidebarItem } from '$lib/components/app-sidebar.svelte';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const { user } = event.locals;
	const userId = user!.id;

	const notesClient = getNotesClient();
	const foldersClient = getFoldersClient();

	const [notesListResp, foldersListResp] = await Promise.all([
		notesClient.list.$get({ query: { userId } }),
		foldersClient.list.$get({ query: { userId } })
	]);

	const [notesList, foldersList] = await Promise.all([
		notesListResp.json(),
		foldersListResp.json()
	]);

	const sidebarItems: SidebarItem[] = [
		{
			title: 'Notes',
			id: 'notes',
			url: '#',
			items: notesList.map((note) => {
				return {
					title: note.title,
					id: note.id,
					url: `/notes/${note.id}`
				};
			})
		},
		...foldersList.map((folder) => {
			return {
				title: folder.name,
				id: folder.id,
				url: `/folders/${folder.id}`,
				items: folder.subFolders.map((subFolder) => {
					return {
						title: subFolder.name,
						id: subFolder.id,
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
