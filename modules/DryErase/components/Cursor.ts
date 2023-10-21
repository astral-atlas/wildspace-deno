import { act, hash, schedule } from "../deps.ts";
import { WhiteboardState } from "../state.ts";
import { WhiteboardLocalState, useWhiteboardSelector } from "./useWhiteboardState.ts";

const { h, useRef, useMemo } = act;
const { useAnimation } = schedule;

export type CursorIndicatorProps = {
  cursorIndex: number,
  state: WhiteboardLocalState,
}

export const styles = {
  cursor: {
    height: '10px',
    width: '10px',
    borderRadius: '10px',
    position: 'absolute',
    top: 0,
    left: 0,
  }
} as const;

export const CursorIndicator: act.Component<CursorIndicatorProps> = ({ cursorIndex, state }) => { 
  const elementRef = useRef<HTMLElement | null>(null);

  const color = useWhiteboardSelector(state, useMemo(() => (state: WhiteboardState) => {
    const hue = hash.fastHashCode(state.cursors[cursorIndex].id) % 360
    return `hsl(${hue}deg, 50%, 50%)`;
  }, [cursorIndex]), 'black');

  useAnimation('WhiteboardCursor', () => {
    const cursor = state.data.cursors[cursorIndex];
    const element = elementRef.current;
    if (!element)
      return;
    const position = {
      x: cursor.position.x + state.camera.x,
      y: cursor.position.y + state.camera.y,
    }
    const transform = `translate(${position.x}px, ${position.y}px)`
    element.style.transform = transform;
  });

  return h('div', { style: { ...styles.cursor, backgroundColor: color }, ref: elementRef })
};
