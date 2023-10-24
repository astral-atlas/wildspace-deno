export const isArrayEqual = <T>(a: readonly T[], b:  readonly T[]): boolean => {
  return a.length === b.length && a.every(e => b.includes(e));
}