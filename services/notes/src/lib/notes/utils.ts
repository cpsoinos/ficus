export const noteStorageBasePath = (userId: string, noteId: string) => {
	return `${userId}/${noteId}`;
};

export const noteContentStoragePath = (userId: string, noteId: string) => {
	return `${noteStorageBasePath(userId, noteId)}/content.md`;
};

export const noteAttachmentStoragePath = (userId: string, noteId: string, attachmentId: string) => {
	return `${noteStorageBasePath(userId, noteId)}/attachments/${attachmentId}`;
};
