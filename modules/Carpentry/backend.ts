import { nanoid, simpleSystem, stage } from "./deps.ts";
import {
  roomSystemDef,
  roomContentSystemDef,
  RoomSystem,
  RoomContentSystem,
} from "./system.ts";

export type Backend = {
  room: simpleSystem.Components<RoomSystem>;
  roomContent: simpleSystem.Components<RoomContentSystem>;

  stageBackend: stage.Backend,
};

export const createBackend = (
  world: simpleSystem.World,
  stageBackend: stage.Backend,
): Backend => {
  const room = simpleSystem.createComponents<RoomSystem>(world, {
    definition: roomSystemDef,
    service: {
      async create(input) {
        const id = nanoid();
        await roomContent.service.create({
          gameId: input.gameId,
          roomId: id,
          currentScene: null
        })
        return {
          id,
          ...input,
        }
      },
      update: (previous, input) => ({
        ...previous,
        name: input.name || previous.name,
      }),
      calculateKey(input) {
        return {
          part: input.gameId,
          sort: input.id,
        }
      },
    },
  });
  const roomContent = simpleSystem.createComponents<RoomContentSystem>(world, {
    definition: roomContentSystemDef,
    service: {
      create: (input) => input,
      update: (previous, input) => ({
        ...previous,
        currentScene: input.nextScene,
      }),
      calculateKey: input => ({
        part: input.gameId,
        sort: input.roomId
      })
    },
  });

  return { stageBackend, room, roomContent };
};
