export type BufferQueue<T> = {
  push: (value: T) => void,
  drain: () => T[],
}

export const createBufferQueue = <T>() => {
  let values: T[] = [];
  const push = (value: T) => {
    values.push(value);
  };
  const drain = () => {
    const drainedValues = values;
    values = [];
    return drainedValues;
  };
  return { push, drain };
};