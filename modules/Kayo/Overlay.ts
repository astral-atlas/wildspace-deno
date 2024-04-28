// @deno-types="vite-css"
import styles from './kayo.module.css';

import { act } from "./deps.ts";
const { h, useEffect, useState, useContext, useRef } = act;

export type OverlayManager = {
  addElement(): void,
  removeElement(): void,
};

export const overlayRootContext = act.createContext<Element | null>(null);

export const useOverlayRoot = () => {
  return useContext(overlayRootContext) as Element;
}

export const useOverlayedElement = (ref: act.Ref<Element | null>) => {
  const root = useContext(overlayRootContext);

  useEffect(() => {
    const { current: overlayedElement} = ref;
    if (!overlayedElement || !root)
      return;
    root.append(overlayedElement);
    return () => {
      if (overlayedElement.parentElement === root)
        root.removeChild(overlayedElement);
    }
  }, [root]);
};

export const OverlayRoot: act.Component = ({ children }) => {
  const ref = useRef<Element | null>(null);
  const [root, setRoot] = useState<Element | null>(null);

  useEffect(() => {
    setRoot(ref.current);
    return () => {
      setRoot(null);
    }
  }, [])

  return h('div', { class: styles.overlay }, [
    h(overlayRootContext.Provider, { value: root }, children),
    h('div', { ref, style: { position: 'absolute', top: '0px', left: '0px' }, ignoreChildren: true }),
  ]);
};

export const OverlayRect: act.Component = () => {
  return h('null', {}, [

  ]);
};