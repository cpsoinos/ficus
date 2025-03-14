import { BaseModel } from '../base-model';

import { app } from './app';
import { downloadAttachment } from './downloadAttachment';

export class AttachmentsEntrypoint extends BaseModel<'attachments'> {
	async download({ attachmentId, userId }: { attachmentId: string; userId: string }): Promise<{
		fileName: string | undefined;
		body: ReadableStream;
		size: number;
		contentType: string | undefined;
	} | null> {
		return downloadAttachment({ attachmentId, userId });
	}

	override fetch(req: Request) {
		return app.fetch(req);
	}
}
