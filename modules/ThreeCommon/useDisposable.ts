import { useEffect, useRef } from "https://esm.sh/@lukekaalim/act@2.6.0";

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
