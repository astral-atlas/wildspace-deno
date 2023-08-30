import { useEffect, useRef } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { act } from "./deps.ts";

export const useDisposable = <T extends { dispose: () => unknown }>(
  createResource: () => T,
): T => {
  const resourceRef = useRef(createResource());

  useEffect(() => {

    return () => {
      resourceRef.current.dispose();
    }
  }, []);

  return resourceRef.current;
};


export const useStateDisposable = <T extends { dispose: () => unknown }>(
  createResource: () => T,
  deps: act.Deps = [],
): T | null => {
  const [resource, setResource] = act.useState<T | null>(null);

  act.useEffect(() => {
    const resource = createResource()
    setResource(resource);

    return () => {
      resource.dispose();
    }
  }, deps);

  return resource;
};
