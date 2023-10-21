import { act, schedule } from "../deps.ts";
import { Note } from "../models.ts";
import { WhiteboardLocalState, useWhiteboardSelector } from "./useWhiteboardState.ts";
const { h, useMemo, useRef } = act;

export type NoteEditorProps = {
  state: WhiteboardLocalState,
  noteIndex: number,
}

const style = {
  noteContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'blue',
  },
  noteTextEditor: {
    height: '100%',
    width: '100%',
    minHeight: '0',
    minWidth: '0',
  }
}

export const NoteEditor: act.Component<NoteEditorProps> = ({ state, noteIndex }) => {
  const elementRef = useRef<HTMLElement | null>(null);

  const note = useWhiteboardSelector(state, useMemo(() => (state) => {
    return state.notes[noteIndex];
  }, [noteIndex]), undefined);

  if (!note)
    return null;

  schedule.useAnimation('WhiteboardNote', () => {
    const x = note.position.x + state.camera.x;
    const y = note.position.y + state.camera.y;
    const transform = `translate(${x}px, ${y}px)`;

    if (elementRef.current)
      elementRef.current.style.transform = transform;
  });

  return h('div', { ref: elementRef, style: {
    ...style.noteContainer,
    width: note.size.x + 'px',
    height: note.size.y + 'px',
  } }, h('textarea', { style: style.noteTextEditor }))
}

