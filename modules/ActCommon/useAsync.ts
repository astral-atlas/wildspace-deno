import { useEffect } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { act } from "./deps.ts";

const { useState } = act;

export const useAsync = <T>(createPromise: () => Promise<T>, deps: act.Deps = []): T | null => {
  const [resolution, setResolution] = useState<T | null>(null);
  const [, setRejection] = useState<unknown | null>(null);

  useEffect(() => {
    createPromise()
      .then(setResolution)
      .catch(e => (console.error(e), setRejection(e)))
  }, deps);

  if (resolution)
    return resolution;

  return null;
}