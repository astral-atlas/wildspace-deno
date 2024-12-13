import { act } from "atlas-renderer";
import classes from './debug.module.css';

const portalContext = act.createContext<HTMLElement | null>(null);

export const LaminateDebug: act.Component = ({ children }) => {
  const [portal, setPortal] = act.useState<HTMLElement | null>(null);

  return [
    act.h(portalContext.Provider, { value: portal }, children),
    act.h('svg', { class: classes.debug }, [
      act.h('g', { ref: setPortal, ignoreChilren: true }),
    ])
  ]
}

export const LaminateDebugPortal: act.Component = ({ children }) => {
  const portal = act.useContext(portalContext);

  const ref = act.useRef<HTMLElement | null>(null);

  act.useEffect(() => {
    const current = ref.current;

    if (!portal || !current)
      return;

    portal.append(current);
    return () => portal.removeChild(current);
  }, [portal]);

  return act.h('g', { ref }, children);
};
