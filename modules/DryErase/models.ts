import { m } from "./deps.ts";

export const whiteboardVectorDefinition = m.object({
  x: m.number,
  y: m.number
})
export type WhiteboardVector = m.OfModelType<typeof whiteboardVectorDefinition>

export const stickerContentDefinition = m.union2([
  m.object({ type: m.literal('null') }),
  m.object({ type: m.literal('asset'), assetId: m.string, ownerId: m.string }),
  m.object({ type: m.literal('note'), text: m.string }),
])
export type StickerContent = m.OfModelType<typeof stickerContentDefinition>;

export const stickerDefinition = m.object({
  id: m.string,
  whiteboardId: m.string,
  layerId: m.string,

  content: stickerContentDefinition,

  size: whiteboardVectorDefinition,
  position: whiteboardVectorDefinition,
  rotation: m.number,
});
export type Sticker = m.OfModelType<typeof stickerDefinition>;

export const whiteboardCanvasDefinition = m.object({
  id: m.string,
  layerId: m.string,
  assetId: m.string,
  size: whiteboardVectorDefinition,
  position: whiteboardVectorDefinition,
});
export type WhiteboardCanvas = m.OfModelType<typeof whiteboardCanvasDefinition>;
export const whiteboardBrushDefinition = m.object({
  color: m.string,
  mode: m.set(['add', 'erase'] as const),
});
export const whiteboardStrokeDefinition = m.object({
  id: m.string,
  layerId: m.string,
  whiteboardId: m.string,
  brush: whiteboardBrushDefinition,
  
  points: m.array(whiteboardVectorDefinition),
});
export type WhiteboardStroke = m.OfModelType<typeof whiteboardStrokeDefinition>;

export const whiteboardCursorDefinition = m.object({
  id: m.string,
  ownerId: m.string,
  whiteboardId: m.string,
  position: whiteboardVectorDefinition,
});
export type WhiteboardCursor = m.OfModelType<typeof whiteboardCursorDefinition>;
export const noteDefinition = m.object({
  id: m.string,
  ownerId: m.string,
  whiteboardId: m.string,

  position: whiteboardVectorDefinition,
  size: whiteboardVectorDefinition,
});
export type Note = m.OfModelType<typeof noteDefinition>;

export const whiteboardLayerDefinition = m.object({
  id: m.string,
  ownerId: m.string,
});
export const whiteboardDefinition = m.object({
  name: m.string,
  id: m.string,
  ownerId: m.string,

  layers: m.array(whiteboardLayerDefinition),
});
export type Whiteboard = m.OfModelType<typeof whiteboardDefinition>;