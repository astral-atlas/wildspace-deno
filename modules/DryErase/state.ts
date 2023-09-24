import { m } from "./deps.ts";
import { whiteboardCanvasDefinition, whiteboardCursorDefinition, whiteboardStickerDefinition, whiteboardStrokeDefinition } from "./models.ts";

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
});
export type WhiteboardState = m.OfModelType<typeof whiteboardStateDefinintion>;
