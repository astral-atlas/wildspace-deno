import { act, janitor } from './deps.ts';
const { createContext, h, useEffect, useState, useContext } = act;

export const createDocContext = <T, Y = void>(
  createValue: (cleanup: janitor.Cleanup, hookResult: Y) => (T | Promise<T>),
  runHooks?: () => Y,
) => {
  const context = createContext<T | null>(null);
  const Provider: act.Component = ({ children }) => {
    const [value, setValue] = useState<T | null>(null);
    const hookResult = runHooks && runHooks();
    useEffect(() => {
      const cleanup = janitor.createCleanupTask();
      const load = async () => {
        setValue(await createValue(cleanup, (hookResult as Y)))
      }
      load()
        .catch(console.error)
      return () => {
        cleanup.run();
      }
    }, [hookResult])
    if (!value)
      return null;

    return h(context.Provider, { value }, children)
  };
  const useDocContext = () => {
    const value = useContext(context)
    if (!value)
      throw new Error(`Doc Context not loaded yet`);
    return value;
  };
  return {
    context,
    Provider,
    useDocContext,
  }
}