import { channel, m, rxjs, simpleSystem } from './deps.ts';
import { Backend } from "./backend.ts";
import { SceneNodeID } from './scene.ts';
import { SceneNodeSystem, sceneNodeSystemDef } from './systems.ts';

export const updateDef = simpleSystem.createUpdateChannelDefinition<
  SceneNodeSystem
>(sceneNodeSystemDef);

export const stageChannelDef = {
  incoming: updateDef.incoming,
  outgoing: m.literal(null),
} as const;
export type StageChannelType = channel.OfChannelType<
  typeof stageChannelDef
>;

export const createStageChannel = async (
  backend: Backend,
  gameId: string,
  sceneNodeId: SceneNodeID,
): Promise<channel.Channel<StageChannelType>> => {
  await backend.sceneNodes.service.read({ gameId, sceneNodeId });
  
  const band = backend.sceneNodes.atoms.band.connect({ gameId, sceneNodeId })

  return {
    recieve: band.recieve,
    send() {
      console.log('dontcare')
    },
    close() {
      band.close()
    }
  }
};
