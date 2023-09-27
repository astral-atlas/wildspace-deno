import { ArtifactService } from "../service.ts";

export type BlobService = {
  uploadBlob: (key: string, buffer: Uint8Array) => Promise<void>,
  downloadBlob: (key: string) => Promise<Uint8Array>,
};

export type BlobStreamService = {
  uploadStream: (
    ownerId: string,
    assetId: string,
    stream: ReadableStream<Uint8Array>
  ) => Promise<void>,
  downloadStream: (
    ownerId: string,
    assetId: string,
  ) => Promise<ReadableStream<Uint8Array>>,
};

export const createMemoryBlobStreamService = (
  artifact: ArtifactService,
): BlobStreamService => {
  const blobs = new Map<string, Blob>();

  return {
    async uploadStream(ownerId, assetId, stream) {
      const parts: Uint8Array[] = [];
      for await (const part of stream) {
        parts.push(part);
      }
      blobs.set([ownerId, assetId].join('-'), new Blob(parts))

      await artifact.assets.update({ ownerId, assetId }, {
        ownerId,
        state: 'uploaded',
        contentLength: null,
        contentType: null,
        users: null,
      });
      return;
    },
    downloadStream(ownerId, assetId) {
      const blob = blobs.get([ownerId, assetId].join('-'));
      if (!blob)
        throw new Error('No blob by that key found!');
      
      return Promise.resolve(blob.stream());
    }
  }
};