import { artifact, m } from "../deps.ts";
import {
  stickerContentDefinition,
  stickerDefinition,
  whiteboardCursorDefinition,
  whiteboardStrokeDefinition,
  whiteboardVectorDefinition,
} from "../models.ts";
import { objectReference } from "../protocol.ts";

export const objectTypeDef = m.set([
  'note',
  'sticker',
  'stroke',
] as const);
export type ObjectType = m.OfModelType<typeof objectTypeDef>;

export const objectTargetDef = m.union2([
  m.object({
    type: m.literal("null"),
  }),
  m.object({
    type: m.literal("note"),
    noteId: m.string
  }),
  m.object({
    type: m.literal("sticker"),
    stickerId: m.string
  }),
  m.object({
    type: m.literal("stroke"),
    strokeId: m.string
  }),
]);
export type ObjectTarget = m.OfModelType<typeof objectTargetDef>;
export const objectUpdateDef = m.union2([
  m.object({
    type: m.literal("content"),
    content: stickerContentDefinition,
  }),
  m.object({
    type: m.literal("draw"),
    points: m.array(whiteboardVectorDefinition),
  }),
  m.object({
    type: m.literal("transform"),
    position: m.nullable(whiteboardVectorDefinition),
    size: m.nullable(whiteboardVectorDefinition),
  }),
  m.object({
    type: m.literal("delete"),
  }),
]);
export type ObjectUpdate = m.OfModelType<typeof objectUpdateDef>;


export const clientProtocolDef = m.union({
  // "Cursor action"
  // aka things that have to do with the cursor position.
  "move-cursor": m.object({
    type: m.literal("move-cursor"),
    position: whiteboardVectorDefinition,
  }),

  // "Object actions"
  "select-object": m.object({
    type: m.literal("select-object"),
    target: objectReference,
  }),
  "create-object": m.object({
    type: m.literal("create-object"),
    objectType: objectTypeDef,
  }),
  "update-object": m.object({
    type: m.literal("update-object"),
    update: objectUpdateDef
  }),
});
export type ClientProtocol = m.OfModelType<typeof clientProtocolDef>;
