import { m, simpleSystem } from "./deps.ts";
import { sceneNodeDef, sceneContentDef } from "./scene.ts";

export const sceneNodeSystemDef = {
  key: "stage/scene-node",
  names: {
    partition: "gameId",
    sort: "sceneNodeId",
    resource: "sceneNode",
  },
  models: {
    resource: sceneNodeDef,
    create: m.object({
      gameId: m.string,
      content: sceneContentDef,
    }),
    update: m.object({
      type: m.literal('content'),
      content: sceneContentDef,
    })
  },
} as const;
export type SceneNodeSystem = simpleSystem.TypeOfSimpleSystem<
  typeof sceneNodeSystemDef
>;
