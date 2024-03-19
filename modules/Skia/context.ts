import { useContext, useEffect, useState } from "@lukekaalim/act";
import { act, canvaskit, rxjs } from "./deps.ts";

export type DynamicModuleLoader<T> = {
  load: () => Promise<T>,
  state: 'initial' | 'loading' | 'loaded',
  loading: rxjs.Observable<T>,
  module: T | null
}

export const createDynamicModuleLoader = <T>(load: () => Promise<T>) => {
  const loading = new rxjs.Subject<T>();
  const loader: DynamicModuleLoader<T> = {
    async load() {
      if (!loader.module) {
        if (loader.state === 'initial') {
          loader.state = 'loading';
          loader.module = await load();
          loader.state = 'loaded';
          loading.next(loader.module);
        } else {
          loader.module = await rxjs.firstValueFrom(loading);
        }
      }
      return loader.module;
    },
    state: 'initial',
    loading,
    module: null,
  }
  return loader;
}

const defaultCanvasKitLoader = createDynamicModuleLoader(() => canvaskit.default({
  locateFile: (file: string) => 'https://unpkg.com/canvaskit-wasm@latest/bin/'+file,
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