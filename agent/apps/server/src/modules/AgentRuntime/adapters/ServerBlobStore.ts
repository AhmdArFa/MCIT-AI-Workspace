import type { BlobRef, BlobStore } from '@tut/agent-runtime';
import type { TutChatDatabase } from '@tut/database';

import { FileService } from '@/server/services/file';

export class ServerBlobStore implements BlobStore {
  private fileService?: FileService;

  constructor(
    private readonly db: TutChatDatabase,
    private readonly userId: string,
    private readonly workspaceId?: string,
  ) {}

  async persistBase64(base64Data: string, pathname: string) {
    return this.getFileService().uploadBase64(base64Data, pathname);
  }

  async resolveUrl(ref: BlobRef) {
    return this.getFileService().getFileAccessUrl(ref);
  }

  private getFileService() {
    this.fileService ??= new FileService(this.db, this.userId, this.workspaceId);
    return this.fileService;
  }
}
