import { artifact, m } from "./deps.ts";
import { Sticker, WhiteboardCursor, WhiteboardStroke, noteDefinition, whiteboardCanvasDefinition, whiteboardCursorDefinition, whiteboardStrokeDefinition } from "./models.ts";
import { ObjectTarget, ServerProtocol } from "./protocol/mod.ts";

export const whiteboardLayerStateDefinition = m.object({
  layerId: m.string,
  strokes: m.array(whiteboardStrokeDefinition),
  canvases: m.array(whiteboardCanvasDefinition),
});
export type WhiteboardLayerState = m.OfModelType<
  typeof whiteboardLayerStateDefinition
>;

export const whiteboardStateDefinintion = m.object({
  cursors: m.array(whiteboardCursorDefinition),
  strokes: m.array(whiteboardStrokeDefinition),
  notes: m.array(noteDefinition),
  assets: m.array(
    m.object({
      downloadURL: m.string,
      assetId: artifact.assetIdDefinition,
    })
  ),
});
export type WhiteboardState = m.OfModelType<typeof whiteboardStateDefinintion>;


export type WhiteboardMutableState = {
  selected: ObjectTarget,

  cursors:  Map<WhiteboardCursor["id"], WhiteboardCursor>,
  stickers: Map<Sticker["id"], Sticker>,
  strokes:  Map<WhiteboardStroke["id"], WhiteboardStroke>,

  assetList: artifact.AssetList,
};

export const createMutableState = (): WhiteboardMutableState => ({
  selected: { type: 'null' },

  cursors: new Map(),
  stickers: new Map(),
  strokes: new Map(),
  
  assetList: [],
});

export const updateMutableState = (
  state: WhiteboardMutableState,
  event: ServerProtocol
) => {
  switch (event.type) {
    case "init": {
      state.cursors = new Map(event.init.cursors.map(c => [c.id, c]));
      state.stickers = new Map(event.init.stickers.map(s => [s.id, s]));
      state.strokes = new Map(event.init.strokes.map(s => [s.id, s]));
      state.assetList = event.init.assetList
      return;
    }
    case 'select-object': {
      state.selected = event.target;
      return;
    }
    case "set-cursor": {
      const cursor = state.cursors.get(event.cursor.id);
      if (!cursor)
        state.cursors.set(event.cursor.id, event.cursor);
      else {
        cursor.position = event.cursor.position;
      }
      return;
    }
    case 'delete-cursor': {
      state.cursors.delete(event.cursorId);
      return;
    }
    case 'update-assets':
      state.assetList = event.assetList;
      return;

    case 'create-object': {
      switch (event.object.type) {
        default:
          return;
        case 'stroke':
          return state.strokes.set(event.object.stroke.id, event.object.stroke);
        case 'sticker':
          return state.stickers.set(event.object.sticker.id, event.object.sticker);
      }
    }
    case 'update-object': {
      switch (event.subject.type) {
        case 'stroke': {
          const stroke = state.strokes.get(event.subject.strokeId);
          if (!stroke)
            return;
          switch (event.update.type) {
            case 'draw':
              stroke.points = [...stroke.points, ...event.update.points];
              return;
            default:
              return;
          }
        }
        case 'sticker': {
          const sticker = state.stickers.get(event.subject.stickerId);
          if (!sticker)
            return;
          switch (event.update.type) {
            case 'content':
              sticker.content = event.update.content;
              return;
            case 'delete':
              state.stickers.delete(event.subject.stickerId)
              return;
            case 'transform':
              sticker.position = event.update.position || sticker.position;
              sticker.size = event.update.size || sticker.size;
              return;
            default:
              return;
          }
        }
        default:
          return;
      }
    }
  }
}