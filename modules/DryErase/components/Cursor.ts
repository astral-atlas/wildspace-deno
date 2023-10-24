import { act, hash, schedule } from "../deps.ts";
import { WhiteboardState } from "../state.ts";
import { WhiteboardLocalState, useWhiteboardSelector } from "./useWhiteboardState.ts";

const { h, useRef, useMemo } = act;
const { useAnimation } = schedule;

export type CursorIndicatorProps = {
  cursorId: string,
  state: WhiteboardLocalState,
}

export const styles = {
  cursor: {
    height: '10px',
    width: '10px',
    borderRadius: '10px',
    position: 'absolute',
    pointerEvents: 'none',
    top: 0,
    left: 0,
  }
} as const;

export const CursorIndicator: act.Component<CursorIndicatorProps> = ({ cursorId, state }) => { 
  const elementRef = useRef<HTMLElement | null>(null);

  const cursor = useWhiteboardSelector(
    state,
    useMemo(() => (state) => state.cursors.get(cursorId), [cursorId]),
    null
  );
  if (!cursor)
    return null;

  const color = useMemo(() => {
    const hue = hash.fastHashCode(cursorId) % 360
    return `hsl(${hue}deg, 50%, 50%)`;
  }, [cursorId])

  useAnimation('WhiteboardCursor', () => {
    const element = elementRef.current;
    if (!element)
      return;
    const position = {
      x: cursor.position.x + state.camera.x,
      y: cursor.position.y + state.camera.y,
    }
    const transform = `translate(${position.x}px, ${position.y}px)`
    element.style.transform = transform;
  }, [cursor]);

  return h('div', { style: { ...styles.cursor, backgroundColor: color }, ref: elementRef })
};
