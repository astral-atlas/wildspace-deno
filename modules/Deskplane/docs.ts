import { h, Component } from "https://esm.sh/v126/@lukekaalim/act@2.6.0";
import { Vector2 } from "https://esm.sh/three@0.155.0";
import { DocSheet } from "../ComponentDoc/DocElement.ts";
import { GridSVG } from './GridSVG.ts';
import { useContext, useEffect, useMemo, useRef } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { useKeyboardElementRef } from "../Keyboard/useKeyboardElementRef.ts";
import { keyboardStateControllerContext } from "../Keyboard/keyboardStateController.ts";
import { useAnimation } from "../FrameScheduler/useAnimation.ts";
import { Deskplane } from "./Deskplane.ts";
import { useDraggableSurface } from "./useDraggableSurface.ts";

export const GridSVGDemo: Component = () => {
  const ref = useRef(null);

  const position = useRef(new Vector2()).current;

  useKeyboardElementRef(ref)

  const keyboard = useContext(keyboardStateControllerContext);
  useAnimation('Keypress Anim', ({ deltaMs }) => {
    const speed = .1 * deltaMs;
    const directions: { [key: string]: Vector2 } = {
      'ArrowUp': new Vector2(0, 1),
      'ArrowDown': new Vector2(0, -1),
      'ArrowLeft': new Vector2(1, 0),
      'ArrowRight': new Vector2(-1, 0),
    };
    const direction = [...keyboard.keysDown]
      .map(key => directions[key] || new Vector2(0, 0))
      .reduce((acc, curr) => acc.add(curr), new Vector2(0, 0))
      .multiplyScalar(speed)

    position.add(direction);
  }, []);

  const patternRef = useRef<SVGPatternElement | null>(null);
  
  useAnimation('GridSVGAnim', ({ now }) => {
    patternRef.current?.setAttribute('x', (Math.cos(now / 1000) * 100).toString());
    patternRef.current?.setAttribute('y', (Math.sin(now / 1000) * 100).toString());
  })

  return h('div', { ref, tabIndex: 0 }, [
    h(GridSVG, { patternRef })
  ]);
}

export const DeskPlaneDemo = () => {
  return h(Deskplane);
};

export const DraggableSurfaceDemo = () => {
  const ref = useRef<null | HTMLElement>(null);
  const dragged = useRef(new Vector2(0, 0)).current;

  const onDrag = useMemo(() => (delta: Vector2, element: Element) => {
    dragged.add(delta);
    if (element instanceof HTMLElement)
      element.innerText = `Drag me!\n${dragged.x}, ${dragged.y}`
  }, []);

  useDraggableSurface(ref, onDrag)

  return h('pre', { ref, style: { userSelect: 'none' } }, `Drag me!\n${dragged.x}, ${dragged.y}`)
}

export const deskplaneDocs: DocSheet[] = [
  { id: 'SVG', elements: [
    { type: 'title', text: 'SVG' },
    { type: 'rich', richElement: h(GridSVGDemo) }
  ] },
  { id: 'Deskplane', elements: [
    { type: 'title', text: 'Desk Plane' },
    { type: 'rich', richElement: h(DeskPlaneDemo) }
  ] },
  { id: 'DraggableSurface', elements: [
    { type: 'title', text: 'Draggable Surface' },
    { type: 'rich', richElement: h(DraggableSurfaceDemo) }
  ] }
]