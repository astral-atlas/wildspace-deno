import { m, presentation } from "./deps.ts";

export const sceneNodeId = m.string;
export type SceneNodeID = m.OfModelType<typeof sceneNodeId>

export const sceneContentDef = m.union2([
  m.object({
    type: m.literal('backgrounded'),
    background: sceneNodeId,
    foreground: sceneNodeId,
  }),
  m.object({
    type: m.literal('slide'),
    slideId: m.string,
  }),
  m.object({
    type: m.literal('whiteboard'),
    whiteboardId: m.string,
  }),
]);
export type SceneContent = m.OfModelType<typeof sceneContentDef>

export const sceneNodeDef = m.object({
  gameId: m.string,
  id: sceneNodeId,
  content: sceneContentDef,
})
export type SceneNode = m.OfModelType<typeof sceneNodeDef>
