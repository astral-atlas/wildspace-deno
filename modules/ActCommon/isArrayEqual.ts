export const isArrayEqual = (
  a: readonly unknown[],
  b:  readonly unknown[]
): boolean => {
  return a.length === b.length && a.every(e => b.includes(e));
}