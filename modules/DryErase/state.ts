import { m } from "./deps.ts";
import { whiteboardCanvasDefinition, whiteboardCursorDefinition, whiteboardDefinition, whiteboardStickerDefinition, whiteboardStrokeDefinition } from "./models.ts";

export const whiteboardLayerStateDefinition = m.object({
  layerId: m.string,
  strokes: m.array(whiteboardStrokeDefinition),
  canvases: m.array(whiteboardCanvasDefinition),
  stickers: m.array(whiteboardStickerDefinition),
})
export type WhiteboardLayerState = m.OfModelType<typeof whiteboardLayerStateDefinition>;

export const whiteboardStateDefinintion = m.object({
  whiteboard: whiteboardDefinition,

  cursors: m.array(whiteboardCursorDefinition),
  layerState: whiteboardLayerStateDefinition
});
export type WhiteboardState = m.OfModelType<typeof whiteboardStateDefinintion>;
