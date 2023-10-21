import { act, rxjs } from "../deps.ts";
import { StateMap } from "../state.ts";
import { LocalState } from "./useLocalState.ts";

export const useWhiteboardStateSelector = <T>(
  localState: LocalState,
  selector: (map: StateMap, prev: T) => T,
  initialValue: T,
  isValueEqual: (left: T, right: T) => boolean = (a, b) => a === b,
) => {
  const getSource = act.useMemo(() => () => {
    return localState.state;
  }, [localState])

  return useStateSelector<T, StateMap>(
    initialValue,
    selector,
    isValueEqual,
    localState.updates,
    getSource
  );
};

export const useStateSelector = <T, Source>(
  initialValue: T,
  calculateValue: (source: Source, prev: T) => T,
  isValueEqual: (left: T, right: T) => boolean, 
  sourceUpdates: rxjs.Observable<unknown>,
  getSource: () => Source,
) => {
  const ref = act.useRef<T>(initialValue);
  const [, setUpdateTime] = act.useState(Date.now());

  act.useMemo(() => {
    const source = getSource();
    const prev = ref.current;
    const next = calculateValue(source, prev);
    if (!isValueEqual(prev, next)) {
      ref.current = next;
    }
  }, [getSource, calculateValue, isValueEqual])

  act.useEffect(() => {
    const sub = sourceUpdates.subscribe(() => {
      const source = getSource();
      const prev = ref.current;
      const next = calculateValue(source, prev);
      if (!isValueEqual(prev, next)) {
        ref.current = next;
        setUpdateTime(Date.now());
      }
    });
    return () => sub.unsubscribe();
  }, [getSource, calculateValue, isValueEqual]);

  return ref.current;
};