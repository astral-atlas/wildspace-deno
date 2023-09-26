export type BlobService = {
  uploadBlob: (key: string, buffer: Uint8Array) => Promise<void>,
  downloadBlob: (key: string) => Promise<Uint8Array>,
};

export type BlobStreamService = {
  uploadStream: (key: string, stream: ReadableStream<Uint8Array>) => Promise<void>,
  downloadStream: (key: string) => Promise<ReadableStream<Uint8Array>>,
};

export const createMemoryBlobStreamService = (): BlobStreamService => {
  const blobs = new Map<string, Blob>();

  return {
    async uploadStream(key, stream) {
      const parts: Uint8Array[] = [];
      for await (const part of stream) {
        parts.push(part);
      }
      blobs.set(key, new Blob(parts))

      return;
    },
    downloadStream(key) {
      const blob = blobs.get(key);
      if (!blob)
        throw new Error('No blob by that key found!');
      
      return Promise.resolve(blob.stream());
    }
  }
};