import { act } from "./deps.ts";

const { useRef, useEffect, useMemo } = act;

export const useDisposable = <T extends (null | { dispose?: () => unknown })>(
  createDisposible: () => T,
  deps: act.Deps = [],
): T => {
  // The "null" value here is never exposed as it's immediatly
  // reassigned afterwards.
  // deno-lint-ignore no-explicit-any
  const valueRef = useRef<T>((null as any));

  useMemo(() => {
    // Dispose + Recreate the value when deps changes.
    if (valueRef.current?.dispose)
      valueRef.current.dispose();

    valueRef.current = createDisposible()
  }, deps);

  useEffect(() => {
    // When this hook is destroyed, dispose this element.
    return () => {
      if (valueRef.current?.dispose)
        valueRef.current.dispose();
    }
  }, [])

  return valueRef.current;
}