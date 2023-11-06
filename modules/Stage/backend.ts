import { nanoid, simpleSystem } from "./deps.ts";
import { SceneNodeSystem, sceneNodeSystemDef } from "./systems.ts";

export type Backend = {
  sceneNodes: simpleSystem.Components<SceneNodeSystem>,
};

export const createBackend = (world: simpleSystem.World): Backend => {
  const sceneNodes = simpleSystem.createComponents<SceneNodeSystem>(world, {
    definition: sceneNodeSystemDef,
    service: {
      create(input) {
        return {
          id: nanoid(),
          ...input,
        }
      },
      calculateKey(input) {
        return {
          part: input.gameId,
          sort: input.id,
        }
      },
      update(previous,input) {
        return {
          ...previous,
          content: input.content,
        }
      },
    }
  });
  return { sceneNodes };
};
