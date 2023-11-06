export type BlobStreamService = {
  uploadStream: (
    key: string,
    stream: ReadableStream<Uint8Array>
  ) => Promise<void>,
  downloadStream: (
    key: string,
  ) => Promise<ReadableStream<Uint8Array>>,
};

export type BlobStreamMemoryService = BlobStreamService & {
  blobs: Map<string, Blob>,
};

export const createMemoryBlobStreamService = (): BlobStreamMemoryService => {
  const blobs = new Map<string, Blob>();

  return {
    blobs,
    async uploadStream(key, stream) {
      const parts: Uint8Array[] = [];
      for await (const part of stream) {
        parts.push(part);
      }
      blobs.set(key, new Blob(parts));
    },
    downloadStream(key) {
      const blob = blobs.get(key);
      if (!blob)
        throw new Error(`No blob for key ${key} found!`);
      
      return Promise.resolve(blob.stream());
    }
  }
};