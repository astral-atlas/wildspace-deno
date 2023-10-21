import { m } from "./deps.ts";
import { noteDefinition, whiteboardCanvasDefinition, whiteboardCursorDefinition, whiteboardStickerDefinition, whiteboardStrokeDefinition } from "./models.ts";
import { Protocol } from "./protocol.ts";

export const whiteboardLayerStateDefinition = m.object({
  layerId: m.string,
  strokes: m.array(whiteboardStrokeDefinition),
  canvases: m.array(whiteboardCanvasDefinition),
  stickers: m.array(whiteboardStickerDefinition),
})
export type WhiteboardLayerState = m.OfModelType<typeof whiteboardLayerStateDefinition>;

export const whiteboardStateDefinintion = m.object({
  cursors: m.array(whiteboardCursorDefinition),
  strokes: m.array(whiteboardStrokeDefinition),
  notes: m.array(noteDefinition),
});
export type WhiteboardState = m.OfModelType<typeof whiteboardStateDefinintion>;

export const reduceWhiteboardStateFromServer = (
  state: WhiteboardState,
  event: Protocol["message"]["server"]
): WhiteboardState => {
  switch (event.type) {
    case "initialize":
      return { ...state, cursors: event.cursors };
    case "pointer-spawn": {
      return { ...state, cursors: [...state.cursors, event.cursor] };
    }
    case "pointer-move":
      return { ...state, cursors: state.cursors.map(c =>
        c.id === event.cursorId ? { ...c, position: event.position } : c)}

    case "stroke-create":
      return { ...state, strokes: [...state.strokes, event.stroke] };
    case "stroke-update":
      return { ...state, strokes: state.strokes.map(s =>
        s.id === event.stroke.id ? event.stroke : s) };

    case "note-create":
      return { ...state, notes: [...state.notes, event.note] };
    case "note-content-update":
      return { ...state, notes: state.notes.map(n =>
        n.id === event.noteId ? { ...n, content: event.content } : n) };
    case "note-move":
      return { ...state, notes: state.notes.map(n =>
        n.id === event.noteId ? { ...n, position: event.position, size: event.size } : n) };
  }
  return state;
}