import { act } from "./deps.ts";
import { useAsync } from "./useAsync.ts";
import { useDisposable } from "./useDisposable.ts";

export const useBlobURL = (blob: Blob) => {
  const { url } = useDisposable(() => {
    const url = URL.createObjectURL(blob);
    const dispose = () => {
      URL.revokeObjectURL(url);
    }
    return { url, dispose }
  }, [blob])

  return act.useMemo(() => new URL(url), [url]);
}

export const useURLBlob = (url: URL): Blob | null => {
  return useAsync(async () => {
    return await fetch(url)
      .then(r => r.blob())
  }, [url.href])
}