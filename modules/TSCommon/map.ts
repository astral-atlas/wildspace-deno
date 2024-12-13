import { Subject } from 'rxjs';
import { rxjs } from './deps';

export type ObservableMap<TKey, TValue> = {
  set(key: TKey, value: TValue): ObservableMap<TKey, TValue>,
  delete(key: TKey): boolean,

  map: Map<TKey, TValue>,
  change: rxjs.Observable<void>,
}

export const createObservableMap = <TKey, TValue>(map: Map<TKey, TValue> = new Map()): ObservableMap<TKey, TValue> => {
  const change = new rxjs.Subject<void>();
  const observableMap: ObservableMap<TKey, TValue> = {
    change,
    map,
    
    set(key, value) {
      const changed = !map.has(key) || (map.get(key) !== value);
      map.set(key, value);
      if (changed)
        change.next()
      return observableMap;
    },
    delete(key) {
      const didDelete = map.delete(key);
      if (didDelete)
        change.next()
      return didDelete;
    },
  };
  return observableMap
}

export const ObservableMap = {
  create: createObservableMap,
}

export type ObservableSet<T> = {
  add(element: T): void,
  delete(element: T): void,

  set: Set<T>,
  change: rxjs.Subject<void>,
}

export const createObservableSet = <T>(set: Set<T> = new Set()): ObservableSet<T> => {
  const change = new Subject<void>();
  
  return {
    add(element) {
      const changed = !set.has(element);
      set.add(element);
      if (changed)
        change.next();
    },
    delete(element) {
      const changed = set.delete(element);
      if (changed)
        change.next();
    },
    set,
    change,
  }
}

export const ObservableSet = {
  create: createObservableSet
}