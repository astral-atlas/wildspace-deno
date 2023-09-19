import { useContext, useEffect, useState } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { act, canvaskit, rxjs } from "./deps.ts";

export type DynamicModuleLoader<T> = {
  load: () => Promise<T>,
  loading: rxjs.Observable<T>,
  module: T | null
}

export const createDynamicModuleLoader = <T>(load: () => Promise<T>) => {
  const loading = new rxjs.Subject<T>();
  const loader: DynamicModuleLoader<T> = {
    async load() {
      if (!loader.module) {
        loader.module = await load();
        loading.next(loader.module);
      }
      return loader.module;
    },
    loading,
    module: null,
  }
  return loader;
}

const defaultCanvasKitLoader = createDynamicModuleLoader(() => canvaskit.default({
  locateFile: (file) => 'https://unpkg.com/canvaskit-wasm@latest/bin/'+file,
}))

export const canvasKitLoaderContext = act.createContext(defaultCanvasKitLoader);

export const useCanvasKit = (): canvaskit.CanvasKit | null => {
  const loader = useContext(canvasKitLoaderContext);
  const [canvasKit, setCanvasKit] = useState(loader.module);

  useEffect(() => {
    loader.load()
      .then(setCanvasKit)
      .catch(console.warn)
  }, [loader]);

  return canvasKit;
}