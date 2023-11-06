import { dryErase, m, presentation, stage } from "./deps.ts";

export const roomIdDef = m.string;
export type RoomID = m.OfModelType<typeof roomIdDef>;
export const roomDef = m.object({
  id: roomIdDef,
  name: m.string,
  gameId: m.string,
});
export type Room = m.OfModelType<typeof roomDef>;

export const roomContentDef = m.object({
  roomId: roomIdDef,
  gameId: m.string,
  currentScene: m.nullable(stage.sceneNodeId),
});
export type RoomContent = m.OfModelType<typeof roomContentDef>;

export const roomResourceDef = m.union2([
  m.object({
    type: m.literal("scene"),
    scene: stage.sceneNodeDef,
  }),
  m.object({
    type: m.literal("slide"),
    slide: presentation.slideDef,
  }),
  m.object({
    type: m.literal("whiteboard"),
    whiteboard: dryErase.whiteboardDefinition,
  }),
]);
export type RoomResource = m.OfModelType<typeof roomResourceDef>;
