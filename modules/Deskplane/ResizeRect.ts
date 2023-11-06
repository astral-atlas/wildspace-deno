import { act, three } from "./deps.ts";
import { useDraggableSurface } from "./useDraggableSurface.ts";

const { h, useRef, useState, useMemo } = act;

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
      ({ x,  y, } as const)
  ));

export const ResizeRectControls: act.Component<ResizeRectControlsProps> = ({
  children,
  rect,
  onResize = (_) => {},
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
      background: 'white',
    },
    x: {
      0: { left: '0' },
      1: { left: '50%' },
      2: { left: '100%' }
    },
    y: {
      0: { top: '0%' },
      1: { top: '50%' },
      2: { top: '100%' },
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
  onResize
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const style = {
    ...styles.handle.common,
    ...styles.handle.x[handle.x],
    ...styles.handle.y[handle.y],
  }
  useDraggableSurface(ref, (_, __, event) => {
    onResize({
      ...rect,
      position: event.
    })
  });
  return h('div', { style, ref });
};

const RotateHandle = () => {};
