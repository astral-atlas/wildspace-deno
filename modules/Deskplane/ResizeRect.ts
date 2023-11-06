import { act, actCommon, three } from "./deps.ts";
import { useDraggableSurface } from "./useDraggableSurface.ts";
import { useDraggableSurface2 } from "./useDraggableSurface2.ts";

// @deno-types="vite-css"
import stylesheet from './ResizeRect.module.css';

const { h, useRef, useState, useMemo, useEffect } = act;
const { useUpdatingMutableValue } = actCommon;

export type Rect = {
  size: { x: number; y: number };
  position: { x: number; y: number };
};

export type ResizeRectControlsProps = {
  rect: Rect;
  onResize?: (rect: Rect) => unknown;
};

const handles = ([0, 1, 2] as const)
  .flatMap((x) => ([0, 1, 2] as const)
    .map((y) =>
      ({ x,  y, } as const))
  );

export const ResizeRectControls: act.Component<ResizeRectControlsProps> = ({
  children,
  rect,
  onResize = _ => {},
}) => {

  return [
    children,
    handles.map(handle =>
      h(ResizeHandle, { handle, rect, onResize }))
  ];
};

const styles = {
  handle: {
    common: {
      position: 'absolute',
      height: '10px',
      width: '10px',
      border: '1px solid black',
      background: 'white'
    },
    x: {
      0: { left: 'calc(0% - 5px)' },
      1: { left: 'calc(50% - 5px)' },
      2: { left: 'calc(100% - 5px)' }
    },
    y: {
      0: { top: 'calc(0% - 5px)' },
      1: { top: 'calc(50% - 5px)' },
      2: { top: 'calc(100% - 5px)' },
    }
  }
}

export type ResizeRectHandleProps = {
  rect: Rect;
  handle: typeof handles[number],
  onResize?: (rect: Rect) => unknown;
};

const ResizeHandle: act.Component<ResizeRectHandleProps> = ({
  handle,
  rect,
  onResize = _ => {}
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const style = {
    ...styles.handle.common,
    ...styles.handle.x[handle.x],
    ...styles.handle.y[handle.y],
  }
  const mutableRect = useUpdatingMutableValue(rect)

  const draggable = useDraggableSurface2(ref);

  useEffect(() => {
    const { current: element } = ref;
    if (!element)
      return;
    let initialRect = mutableRect.current;
    const sub = draggable.onDragStart.subscribe((drag) => {
      initialRect = mutableRect.current;

      drag.changes.subscribe(e => {
        switch (e.type) {
          case 'move': {
            const center = handle.x === 1 && handle.y === 1;
            const positionChange = center ? drag.delta : {
              x: (drag.delta.x * Math.max(0, 1 - handle.x)),
              y: (drag.delta.y * Math.max(0, 1 - handle.y)),
            }
            const sizeChange = center ? { x: 0, y: 0 } : {
              x: (drag.delta.x * Math.max(0, handle.x - 1)) - positionChange.x,
              y: (drag.delta.y * Math.max(0, handle.y - 1)) - positionChange.y
            };
            const size = {
              x: Math.max(10, initialRect.size.x + sizeChange.x),
              y: Math.max(10, initialRect.size.y + sizeChange.y),
            }
            const position = {
              x: initialRect.position.x + positionChange.x,
              y: initialRect.position.y + positionChange.y,
            }
            onResize({ ...initialRect, size, position })
            return;
          }
        }
      })
    });
    return () => {
      sub.unsubscribe();
    }
  }, [])

  const classList = useMemo(() => [
    stylesheet.handle,
    handle.x < 1 && stylesheet.left,
    handle.x > 1 && stylesheet.right,

    handle.y < 1 && stylesheet.top,
    handle.y > 1 && stylesheet.bottom,
    handle.x === 1 && handle.y === 1 && stylesheet.center,
  ].filter(Boolean), [handle]);

  return h('div', { classList, style, ref });
};
