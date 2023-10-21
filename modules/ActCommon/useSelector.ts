import { act, rxjs } from './deps.ts';
import { useUpdatingMutableValue } from "./useEventEffect.ts";
const { useState, useMemo, useEffect, useRef } = act;

export type SelectorSource<SourceType> = {
  retrieve: () => SourceType,
  changes: rxjs.Observable<unknown>,
};
export type Selector<SourceType, ValueType> = (
  source: SourceType,
  prev: ValueType
) => ValueType

export const defaultIsValueEqualComparitor = (a: unknown, b: unknown) => a === b;

export const useSelector = <S, V>(
  source: SelectorSource<S>,
  selector: Selector<S, V>,
  initialValue: V,
  isValueEqual: (a: V, b: V) => boolean = defaultIsValueEqualComparitor
) => {
  // This state variable exists to force re-rendering
  const [, setRenderCount] = useState(0);

  const valueRef = useRef(initialValue);

  useMemo(() => {
    valueRef.current = selector(source.retrieve(), valueRef.current);
  }, [source, selector])

  const onChangeRef = useUpdatingMutableValue(useMemo(() => () => {
    const next = selector(source.retrieve(), valueRef.current);
    if (!isValueEqual(valueRef.current, next)) {
      console.log(`Selector is updating with value`, next)
      valueRef.current = next;
      setRenderCount(r => r + 1);
    }
  }, [source, selector, isValueEqual]));

  useEffect(() => {
    const subscription = source.changes.subscribe(() => {
      onChangeRef.current();
    });

    return () => {
      subscription.unsubscribe();
    }
  }, [source]);

  return valueRef.current;
}