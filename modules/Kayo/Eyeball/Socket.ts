import { Rect, rect2, rect2WithinRect, rectContains } from "space/rects";
import { act, curve } from "../deps";
import { Curtain } from "./Curtain";
import { DialogueContainer } from "./DialogueContainer";
import { DropdownEntry, EyeballEngine, TooltipEntry } from "./engine";
import { vec2, Vector } from "space/vectors";
import { mergeTimeSpans, useArrayAnimation, useTimeSpan } from '../Action/mod.ts';

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

const useFlowAnimation = (ref: act.Ref<HTMLElement | null>, flow: curve.CubicBezierAnimation) => {
  curve.useBezierAnimation(flow, (point) => {
    const element = ref.current;
    if (!element)
      return;
    element.style.opacity = `${(1 - Math.abs(point.position)) * 100}%`;
    element.style.transform = `perspective(800px) translate(0, ${(point.position) * -20}px) rotate3d(1, 0, 0, ${(Math.abs(point.position)) * -90}deg)`
    if (point.position >= 1)
      element.style.display = 'none'
  })
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
  const dropdownAnimations = useArrayAnimation(engine.dropdowns, {
    calculateKey(value) {
      return value.id;
    },
    durationMs: 200
  });
  const tooltipAnimations = useArrayAnimation(engine.tooltips, {
    calculateKey(value) {
      return value.id;
    },
    durationMs: 200
  });

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
      act.h('div', { style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' } }, [
        dropdownAnimations
          .map(({ value: dropdown, id, flow }) => act.h(Dropdown, { engine, dropdown, key: id, flow })),
  
          tooltipAnimations
            .map(({ value: tooltip, id, flow }) => act.h(Tooltip, { tooltip, key: id, engine, flow })),
      ]),

      act.h('pre', { style: { position: 'absolute', top: 0, right: 0 }, ref: debugRef })
    ])
  ]);
};

const Dropdown = ({
  dropdown,
  engine,
  flow
}: { engine: EyeballEngine, dropdown: DropdownEntry, flow: curve.CubicBezierAnimation }) => {
  const ref = act.useRef<HTMLDivElement | null>(null);

  act.useEffect(() => {
    // Once a dropdown has been made, measure the size of the dropdown,
    // and the size of the screen
    const dropdownElement = ref.current;
    const screenspaceElement = engine.screenspaceElementRef.current;
    if (!dropdownElement || !screenspaceElement)
      return;

    const boundingDomRect = dropdownElement.getBoundingClientRect();
    const dropdownSize = vec2(boundingDomRect.width, boundingDomRect.height);
    const screenspaceRect = rect2(vec2(0, 0), vec2(screenspaceElement.clientWidth, screenspaceElement.clientHeight))

    
    const testCandidate = (candidatePosition: Vector<2>) => {
      const candidateRect = rect2(candidatePosition, dropdownSize);
      const candidateFitsWithinScreenspace = rect2WithinRect(screenspaceRect, candidateRect)
      if (candidateFitsWithinScreenspace) {
        dropdownElement.style.left = `${candidatePosition.x}px`
        dropdownElement.style.top = `${candidatePosition.y}px`
        dropdownElement.style.visibility = 'visible';
        dropdownElement.style.pointerEvents = 'auto';
        return true;
      }
      return false;
    }
    const { placementRect } = dropdown;

    [
      vec2(placementRect.position.x, placementRect.position.y + placementRect.size.y),
      vec2(placementRect.position.x + placementRect.size.x - dropdownSize.x, placementRect.position.y + placementRect.size.y),
      vec2(placementRect.position.x, placementRect.position.y - dropdownSize.y),
      vec2(placementRect.position.x + placementRect.size.x - dropdownSize.x, placementRect.position.y - dropdownSize.y),
    ].find(testCandidate)

  }, [])

  useFlowAnimation(ref, flow);

  return [
    // Render the dropdown to intangibly first, so we can
    // calculate it's size before its renderered to the screen
    act.h('div', { ref, style: { position: 'absolute', visibility: 'hidden', pointerEvents: 'none', transformOrigin: 'top center' } },
      dropdown.render(dropdown))
  ];
}

const Tooltip = ({ tooltip, engine, flow }: { tooltip: TooltipEntry, engine: EyeballEngine, flow: curve.CubicBezierAnimation }) => {
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
  }, [tooltip, flow])

  useFlowAnimation(portalStartRef, flow);

  return [
    act.h('div', { ref: portalEndRef, ignoreChildren: true }),
    act.h('null', {}, [
      act.h('div', { ref: portalStartRef, style: { position: 'absolute', transformOrigin: 'top center', pointerEvents: 'auto' } }, tooltip.render(tooltip))
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