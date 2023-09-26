export const createCleanupTask = () => {
  let cleaning = false;
  const cleanupFuncs: (() => void | Promise<unknown>)[] = [];
  const register = (cleanupFunc: () => void | Promise<unknown>) => {
    if (cleaning)
      return cleanupFunc();
    cleanupFuncs.push(cleanupFunc);
  };
  const run = () => {
    if (cleaning)
      return;
    cleaning = true;
    cleanupFuncs
      .map(async cleanupFunc => await cleanupFunc())
      .map(promise => promise.catch(console.error))
  };
  return { register, run }
}