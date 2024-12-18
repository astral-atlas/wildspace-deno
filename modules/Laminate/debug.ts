import { act } from "atlas-renderer";
import classes from './debug.module.css';
import { LaminateService } from "./service";
import { frame } from "./deps";

const portalContext = act.createContext<HTMLElement | null>(null);

export const LaminateDebug: act.Component<{ service: LaminateService }> = ({ children, service }) => {
  const [portal, setPortal] = act.useState<HTMLElement | null>(null);

  const mouseRef = act.useRef<SVGCircleElement | null>(null);

  frame.useAnimation('laminate:debug', () => {
    if (!mouseRef.current)
      return;
  
    mouseRef.current.setAttribute('cx', service.screen.mousePosition.x.toString());
    mouseRef.current.setAttribute('cy', service.screen.mousePosition.y.toString());
  }, [service]);

  act.useEffect(() => {
    console.log('DEBUG RE-RENDER')
  }, [{}])

  return [
    act.h(portalContext.Provider, { value: portal }, children),
    act.h('svg', { class: classes.debug }, [
      act.h('g', { ref: setPortal, ignoreChildren: true }),
      act.h('circle', { ref: mouseRef, r: 5, fill: 'red' }),
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
    console.log('appending')
    return () => {
      console.log('removing')
      portal.removeChild(current);
    }
  }, [{}]);

  return act.h('null', {}, act.h('div', {}, act.h('svg', { id: 'an-id' }, act.h('g', { ref }, children))));
};
