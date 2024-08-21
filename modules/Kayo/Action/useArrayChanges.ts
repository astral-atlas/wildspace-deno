import { act } from "../deps";

export type ArrayChangesState<S> = {
  keys: string[],
  current: S[],
  removed: S[],

  all: S[],
}

export type ArrayChangesConfig<T, S> = {
  initial: ArrayChangesState<S>,

  calculateKey: (value: T) => string,
  create: (key: string, value: T, index: number) => S,
  persist: (value: T, index: number, state: S) => S,
  move: (value: T, index: number, oldIndex: number, state: S) => S,
  remove: (state: S) => S,

  /** Elements that fail the filter check are removed entirely */
  filter: (state: S) => boolean,
};

export type Change =
  | { type: 'persisted' }
  | { type: 'moved', prev: number }
  | { type: 'removed', prev: number }
  | { type: 'created' }

const calculateArrayChanges = <T>(prevArray: ReadonlyArray<T>, nextArray: ReadonlyArray<T>): Change[] => {
  const changes = Array.from<Change>({ length: nextArray.length });
  const foundPrevIndices = new Set();

  for (let nextIndex = 0; nextIndex < nextArray.length; nextIndex++) {
    const nextItem = nextArray[nextIndex];
    if (nextItem === prevArray[nextIndex]) {
      foundPrevIndices.add(nextIndex);
      changes[nextIndex] = { type: 'persisted' }
    } else {
      const prevIndex = prevArray.indexOf(nextItem);
      if (prevIndex === -1) {
        changes[nextIndex] = { type: 'created' }
      } else {
        foundPrevIndices.add(prevIndex);
        changes[nextIndex] = { type: 'moved', prev: prevIndex }
      }
    }
  }
  for (let prevIndex = 0; prevIndex < prevArray.length; prevIndex++) {
    if (!foundPrevIndices.has(prevIndex))
      changes.push({ type: 'removed', prev: prevIndex })
  }

  return changes;
}

const updateState = <T, S>(
  newValues: ReadonlyArray<T>,
  state: ArrayChangesState<S>,
  config: ArrayChangesConfig<T, S>
): ArrayChangesState<S> => {
  const newKeys = newValues.map(config.calculateKey);
  const changes = calculateArrayChanges(state.keys, newKeys);

  const current: S[] = [];
  const removed: S[] = [...state.removed];

  for (let i = 0; i < changes.length; i++) {
    const change = changes[i];
    switch (change.type) {
      case 'persisted':
        current.push(config.persist(newValues[i], i, state.current[i]));
        break;
      case 'removed':
        removed.push(config.remove(state.current[change.prev]))
        break;
      case 'created':
        current.push(config.create(newKeys[i], newValues[i], i));
        break;
      case 'moved':
        current.push(config.move(newValues[i], i, change.prev, state.current[i]));
        break;
    }
  }

  const filteredRemoved = removed.filter(config.filter);

  return {
    keys: newKeys,
    current,
    removed: filteredRemoved,
    all: [...current, ...filteredRemoved,]
  }
}

/**
 * A utility hook that maintains a data structure that runs functions based on if
 * elements are added, removed, or moved around.
 * 
 * You can use it to create a system that records how an element changes over time,
 * use it as a base to animate elements as they move around on the screen.
 * 
 * @param values
 * @param config 
 * @returns 
 */
export const useArrayChanges = <T, S>(values: ReadonlyArray<T>, config: ArrayChangesConfig<T, S>) => {
  const stateRef = act.useRef<ArrayChangesState<S>>(config.initial);

  act.useMemo(() => {
    stateRef.current = updateState(values, stateRef.current, config)
  }, [values]);

  return stateRef.current.all;
};
