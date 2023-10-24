import { artifact, m } from "../deps.ts";
import { noteDefinition, stickerDefinition, whiteboardCursorDefinition, whiteboardStrokeDefinition } from "../models.ts";
import { objectTargetDef, objectUpdateDef } from "./client.ts";

export const objectDef = m.union2([
  m.object({
    type: m.literal("note"),
    note: noteDefinition,
  }),
  m.object({
    type: m.literal("sticker"),
    sticker: stickerDefinition,
  }),
  m.object({
    type: m.literal("stroke"),
    stroke: whiteboardStrokeDefinition,
  }),
]);
export type Object = m.OfModelType<typeof objectDef>;


export const dryEraseInitDef = m.object({
  cursors: m.array(whiteboardCursorDefinition),
  strokes: m.array(whiteboardStrokeDefinition),
  stickers: m.array(stickerDefinition),

  assetList: artifact.assetListDefinition,
});

export const serverProtocolDef = m.union2([
  m.object({
    type: m.literal('set-cursor'),
    cursor: whiteboardCursorDefinition,
  }),
  m.object({
    type: m.literal('delete-cursor'),
    cursorId: whiteboardCursorDefinition.properties.id,
  }),

  // Send immediatly after connection
  m.object({
    type: m.literal("init"),
    init: dryEraseInitDef,
  }),
  m.object({
    type: m.literal("update-assets"),
    assetList: artifact.assetListDefinition,
  }),

  m.object({
    type: m.literal('create-object'),
    object: objectDef,
  }),
  m.object({
    type: m.literal('update-object'),
    subject: objectTargetDef,
    update: objectUpdateDef,
  }),

  // Just a "write back"
  m.object({
    type: m.literal('select-object'),
    target: objectTargetDef,
  }),
] as const);

export type ServerProtocol = m.OfModelType<typeof serverProtocolDef>;