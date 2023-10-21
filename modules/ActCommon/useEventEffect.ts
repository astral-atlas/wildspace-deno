import { act } from "./deps.ts";

const { useEffect, useRef, useMemo } = act;

export const useUpdatingMutableValue = <T>(value: T): act.Ref<T> => {
  const valueRef = useRef(value);

  useMemo(() => {
    valueRef.current = value;
  }, [value]);

  return valueRef;
};
