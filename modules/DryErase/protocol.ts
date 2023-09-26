import { m } from "./deps.ts";
import {
  whiteboardCanvasDefinition,
  whiteboardDefinition,
  whiteboardStickerDefinition,
  whiteboardVectorDefinition,
  whiteboardStrokeDefinition,
  whiteboardCursorDefinition,
  noteDefinition,
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

export const noteMessageDefinitions = {
  "note-submit": m.object({
    type: m.literal("note-submit"),
    position: whiteboardVectorDefinition,
    size: whiteboardVectorDefinition,
  }),
  "note-create": m.object({
    type: m.literal("note-create"),
    note: noteDefinition,
  }),
  "note-move": m.object({
    type: m.literal("note-move"),
    noteId: noteDefinition.properties.id,
    position: whiteboardVectorDefinition,
    size: whiteboardVectorDefinition,
  }),
  "note-content-update": m.object({
    type: m.literal("note-content-update"),
    noteId: noteDefinition.properties.id,
    content: noteDefinition.properties.content,
  }),
  "note-delete": m.object({
    type: m.literal("note-delete"),
    noteId: noteDefinition.properties.id,
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
  ...noteMessageDefinitions,

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
  ...noteMessageDefinitions,
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