import { Rect, rect2, rectContains } from "space/rects";
import { act } from "../deps";
import { Curtain } from "./Curtain";
import { DialogueContainer } from "./DialogueContainer";
import { DropdownEntry, EyeballEngine, TooltipEntry } from "./engine";
import { vec2, Vector } from "space/vectors";

export type SocketProps = {
  engine: EyeballEngine,
};

const DOMRectToSpaceRect = (rect: DOMRect): Rect<2> => {
  return rect2(
    vec2(rect.x, rect.y),
    vec2(rect.width, rect.height)
  )
}

const clientSpaceToSocketSpace = (domPoint: Vector<2>, socketDOMRect: Rect<2>): Vector<2> => {
  return vec2(domPoint.x - socketDOMRect.position.x, domPoint.y - socketDOMRect.position.y)
}

export const Socket: act.Component<SocketProps> = ({ engine, children }) => {
  const debugRef = act.useRef<HTMLElement | null>(null);
  const showDialogueCurtain = engine.dialogues.length > 0;
  const showDropdownCurtain = engine.dropdowns.length > 0;

  const topDialogue = engine.dialogues[engine.dialogues.length - 1];

  const dissmissable = topDialogue && !topDialogue.required;
  const onDismiss = () => {
    if (topDialogue) {
      engine.closeDialogue(topDialogue.id);
    }
  }

  const onPointerMove = (e: PointerEvent) => {
    const screenspaceElement = engine.screenspaceElementRef.current;
    if (!screenspaceElement)
      return;
    const screenspaceRect = screenspaceElement.getBoundingClientRect();

    const mouseSSX = e.clientX - screenspaceRect.left;
    const mouseSSY = e.clientY - screenspaceRect.top;

    engine.pointerPositionRef.current.x = mouseSSX;
    engine.pointerPositionRef.current.y = mouseSSY;

    if (debugRef.current) {
      debugRef.current.innerText = `
screenX: ${e.screenX}
screenY: ${e.screenY}

clientX: ${e.clientX}
clientY: ${e.clientY}

mouseX: ${mouseSSX}
mouseY: ${mouseSSY}
      `.trim();
    }
  };

  return act.h('div', { style: { flex: 1, display: 'flex', flexDirection: 'column' }, onPointerMove, ref: engine.screenspaceElementRef }, [
    act.h(socketContext.Provider, { value: engine }, [
      children,
      showDialogueCurtain && act.h(Curtain, {
        onClick: onDismiss,
        blockCursor: true,
        pointer: true,
        dimBackground: true
      }),

      topDialogue && act.h(DialogueContainer, { entry: topDialogue }),
  
      showDropdownCurtain && act.h(Curtain, {
        onClick: () => engine.clearDropdowns(),
        blockCursor: true,
        pointer: false,
        dimBackground: false
      }),
      act.h('div', { style: { position: 'absolute', top: 0, left: 0 } }, [
        engine.dropdowns.map(dropdown => act.h(Dropdown, { engine, dropdown, key: dropdown.id })),
  
        engine.tooltips.map(tooltip => act.h(Tooltip, { tooltip, key: tooltip.id, engine })),
      ]),

      act.h('pre', { style: { position: 'absolute', top: 0, right: 0 }, ref: debugRef })
    ])
  ]);
};

const Dropdown = ({ dropdown, engine }: { engine: EyeballEngine, dropdown: DropdownEntry }) => {
  return act.h('div', {
    style: {
      position: 'absolute',
      transform: `translate(${dropdown.position.x}px, ${dropdown.position.y}px)`
    }
  }, dropdown.render(dropdown))
}

const Tooltip = ({ tooltip, engine }: { tooltip: TooltipEntry, engine: EyeballEngine }) => {
  console.log(tooltip);
  const portalStartRef = act.useRef<null | HTMLElement>(null);
  const portalEndRef = act.useRef<null | HTMLElement>(null);
  const [pos, setPos] = act.useState<null | Vector<2>>(null);

  act.useEffect(() => {
    const screenspaceEl = engine.screenspaceElementRef.current;
    const portalEndEl = portalEndRef.current;
    const portalStartEl = portalStartRef.current;
    if (!screenspaceEl || !portalEndEl || !portalStartEl)
      return;

    const screenspaceDOMRect = screenspaceEl.getBoundingClientRect();
    const tooltipAnchorDOMRect = tooltip.anchorElement.getBoundingClientRect();

    const tooltipAnchorRect = rect2(
      vec2(tooltipAnchorDOMRect.x - screenspaceDOMRect.x, tooltipAnchorDOMRect.y - screenspaceDOMRect.y),
      vec2(tooltipAnchorDOMRect.width, tooltipAnchorDOMRect.height)
    );

    portalEndEl.append(portalStartEl);
    portalStartEl.style.left = tooltipAnchorRect.position.x + (tooltipAnchorDOMRect.width/2) + 'px';
    portalStartEl.style.top = tooltipAnchorRect.position.y + tooltipAnchorRect.size.y + 'px';
  }, [tooltip])

  return [
    act.h('div', { ref: portalEndRef }),
    act.h('null', {}, [
      act.h('div', { ref: portalStartRef, style: { position: 'absolute' } }, tooltip.render(tooltip))
    ])
  ];
};

export const socketContext = act.createContext<EyeballEngine | null>(null);
export const useEyeballContext = (): EyeballEngine => {
  const eyeballContext = act.useContext(socketContext);
  if (!eyeballContext)
    throw new Error();
  return eyeballContext;
}