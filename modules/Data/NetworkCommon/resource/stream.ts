/**
 * Reads an "unknown length" stream of bytes into an intermediate array,
 * before finally concatinating them into a final buffer.
 */
export const readByteStream = async (stream: ReadableStream<Uint8Array>): Promise<Uint8Array> => {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream)
    chunks.push(chunk);
  const length = chunks.reduce((acc, curr) => acc + curr.byteLength, 0);
  const buffer = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset)
    offset += chunk.byteLength;
  }
  return buffer;
}

/**
 * Reads all the bytes from a readable into a single buffer
 * asynchronously - assuming we know the final size ahead of time.
 */
export const readSizedByteStream = async (
  stream: ReadableStream<Uint8Array>,
  size: number,
): Promise<Uint8Array> => {
  const buffer = new Uint8Array(size);
  let offset = 0;
  for await (const chunk of stream) {
    buffer.set(chunk, offset)
    offset += chunk.byteLength;
  }
  return buffer;
}