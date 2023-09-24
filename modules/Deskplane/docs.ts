import { h, Component } from "https://esm.sh/v126/@lukekaalim/act@2.6.0";
import { DocSheet } from "../ComponentDoc/DocElement.ts";
import { GridSVG } from './GridSVG.ts';
import { useContext, useEffect, useMemo, useRef, useState } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { useKeyboardElementRef } from "../Keyboard/useKeyboardElementRef.ts";
import { keyboardStateControllerContext } from "../Keyboard/keyboardStateController.ts";
import { useAnimation } from "../FrameScheduler/useAnimation.ts";
import { Deskplane } from "./Deskplane.ts";
import { useDraggableSurface } from "./useDraggableSurface.ts";
import { FramePresenter } from "../ComponentDoc/FramePresenter.ts";
import { markdownToSheet } from "../ComponentDoc/markdown.ts";

// @deno-types="vite-text"
import readme from './readme.md?raw';
import { three } from "./deps.ts";

export const GridSVGDemo: Component = () => {
  const ref = useRef(null);

  const position = useRef(new three.Vector2()).current;

  useKeyboardElementRef(ref)

  const keyboard = useContext(keyboardStateControllerContext);
  useAnimation('Keypress Anim', ({ deltaMs }) => {
    const speed = .1 * deltaMs;
    const directions: { [key: string]: three.Vector2 } = {
      'ArrowUp': new three.Vector2(0, 1),
      'ArrowDown': new three.Vector2(0, -1),
      'ArrowLeft': new three.Vector2(1, 0),
      'ArrowRight': new three.Vector2(-1, 0),
    };
    const direction = [...keyboard.keysDown]
      .map(key => directions[key] || new three.Vector2(0, 0))
      .reduce((acc, curr) => acc.add(curr), new three.Vector2(0, 0))
      .multiplyScalar(speed)

    position.add(direction);
  }, []);

  const patternRef = useRef<SVGPatternElement | null>(null);
  
  useAnimation('GridSVGAnim', ({ now }) => {
    patternRef.current?.setAttribute('x', (Math.cos(now / 1000) * 100).toString());
    patternRef.current?.setAttribute('y', (Math.sin(now / 1000) * 100).toString());
  })

  return h(FramePresenter, {}, [
    h('div', { ref, tabIndex: 0, style: { display: 'flex', flex: 1 } }, [
      h(GridSVG, { patternRef, style: { flex: 1, } })
    ])
  ]);
}

export const DeskPlaneDemo = () => {
  const [pos, setPos] = useState(new three.Vector2());
  const ref = useRef(null);
  useDraggableSurface(ref, (delta) => {
    setPos(pos => pos.clone().add(delta))
  });
  const style = {
    transform: `translate(${pos.x}px, ${pos.y}px)`,
    userSelect: 'none'
  };
  const overlayStyle = {
    position: 'absolute',
  }
  return h(FramePresenter, {}, [
    h(Deskplane, { overlayChildren: [h('h2', { style: overlayStyle }, 'Hello')] }, [
      h('h2', { ref, style }, "World!"),
      h('svg', {
        width: 1024,
        height: 1024,
        style: { pointerEvents: 'none', position: 'absolute', top: 0, left: 0 } }, [
        h('rect', { 
          width: 512,
          height: 512,
          stroke: 'black',
          fill: 'none',
          'stroke-width': '4px',
          x: 64,
          y: 64
        })
      ])
    ])
  ])
};

export const DraggableSurfaceDemo = () => {
  const ref = useRef<null | HTMLElement>(null);
  const dragged = useRef(new three.Vector2(0, 0)).current;

  const onDrag = useMemo(() => (delta: three.Vector2, element: Element) => {
    dragged.add(delta);
    if (element instanceof HTMLElement)
      element.innerText = `Drag me!\n${dragged.x}, ${dragged.y}`
  }, []);

  useDraggableSurface(ref, onDrag)

  return h('pre', { ref, style: { userSelect: 'none' } }, `Drag me!\n${dragged.x}, ${dragged.y}`)
}

const demos = {
  deskplane_demo: DeskPlaneDemo,
  gridsvg_demo: GridSVGDemo,
  dragsurface_demo: DraggableSurfaceDemo,
  dragparticle_demo: () => null,
}

export const deskplaneDocs: DocSheet[] = [
  markdownToSheet('Deskplane', readme, demos)
]