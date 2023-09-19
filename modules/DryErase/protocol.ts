import { m } from "./deps.ts";
import {
  whiteboardCanvasDefinition,
  whiteboardDefinition,
  whiteboardStrokePointDefinition,
  whiteboardStickerDefinition,
  whiteboardVectorDefinition,
  whiteboardStrokeDefinition,
whiteboardCursorDefinition,
} from "./models.ts";

export const strokeProtocolMessageDefinitions = {
  "stroke-create": m.object({
    type: m.literal("stroke-create"),
    stroke: whiteboardStrokeDefinition,
  }),
  "stroke-update": m.object({
    type: m.literal("stroke-update"),
    stroke: whiteboardStrokeDefinition,
  }),
} as const;

export const pointerProtocolMessageDefinitions = {
  "pointer-spawn": m.object({
    type: m.literal("pointer-spawn"),
    cursor: whiteboardCursorDefinition,
  }),
  "pointer-move": m.object({
    type: m.literal("pointer-move"),
    cursorId: m.string,
    position: whiteboardVectorDefinition,
  }),
  "pointer-despawn": m.object({
    type: m.literal("pointer-despawn"),
    cursorId: m.string,
  }),
} as const;

export const layerProtocolMessageDefinitions = {
  "layer-canvas-update": m.object({
    type: m.literal("layer-canvas-update"),
    layerId: m.string,
    canvas: m.array(whiteboardCanvasDefinition),
  }),
  "layer-sticker-update": m.object({
    type: m.literal("layer-sticker-update"),
    layerId: m.string,
    stickers: m.array(whiteboardStickerDefinition),
  }),
} as const;

export const whiteboardProtocolMessageDefinition = m.union({
  ...strokeProtocolMessageDefinitions,
  ...layerProtocolMessageDefinitions,
  ...pointerProtocolMessageDefinitions,

  "whiteboard-update": m.object({
    type: m.literal("whiteboard-update"),
    whiteboard: whiteboardDefinition,
  }),
  "initialize": m.object({
    type: m.literal("initialize"),
    cursors: m.array(whiteboardCursorDefinition),
  })
});
export type WhiteboardProtocolMessage = m.OfModelType<
  typeof whiteboardProtocolMessageDefinition
>;


const client = m.union({
  "pointer-move": m.object({
    type: m.literal("pointer-move"),
    position: whiteboardVectorDefinition,
  }),
  "stroke-start": m.object({
    type: m.literal("stroke-start"),
  }),
  "stroke-end": m.object({
    type: m.literal("stroke-end"),
  }),
});
type ClientMessage = m.OfModelType<typeof client>;

export type Protocol = {
  message: {
    client: ClientMessage,
    server: WhiteboardProtocolMessage,
  }
}

export const protocol = {
  client,
  server: whiteboardProtocolMessageDefinition,
};