import { Rect, vec, Vec, MutVec, rect } from "space";
import { act } from "../../deps";

export type EyeballCore = {
  rootRef: act.Ref<null | HTMLElement>,
  screenRect: Rect<2>,
  mousePosition: MutVec<2>,

  getElementScreenspaceRect: (element: HTMLElement) => Rect<2>,
};

export const useCore = (): EyeballCore => {
  const rootRef = act.useRef<null | HTMLElement>(null);
  const mousePosition = act.useRef(vec.new2(0, 0) as MutVec<2>).current;
  const [screenRect, setScreenRect] = act.useState(rect.new2(vec.zero, vec.zero));

  act.useEffect(() => {
    const root = rootRef.current;
    if (!root)
      return;
    const screenDomRect = root.getBoundingClientRect();
    const screenRect = rect.new2(vec.zero, vec.new2(screenDomRect.width, screenDomRect.height));
    setScreenRect(screenRect);

    const onPointerMove = (e: PointerEvent) => {
      const screenDomRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      mousePosition.x = e.clientX - screenDomRect.x;
      mousePosition.y = e.clientY - screenDomRect.y;
    }
    root.addEventListener('pointermove', onPointerMove);
    return () => {
      root.removeEventListener('pointermove', onPointerMove);
    }
  }, [])

  const engine = act.useMemo((): EyeballCore => ({
    mousePosition,
    screenRect,
    rootRef,
    getElementScreenspaceRect(element) {
      if (!rootRef.current)
        return rect.new2(vec.zero, vec.zero);
      const rootDomRect = rootRef.current.getBoundingClientRect();
      const elementDomRect = element.getBoundingClientRect();

      const size = vec.new2(elementDomRect.width, elementDomRect.height);
      const position = vec.new2(rootDomRect.x - elementDomRect.x, rootDomRect.y - elementDomRect.y);
      return rect.new2(position, size);
    },
  }), [screenRect]);

  return engine;
};