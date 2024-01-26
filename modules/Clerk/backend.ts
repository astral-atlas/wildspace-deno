import { data, nanoid } from "./deps.ts";
import {
  fileSystemDef, FileSystem,
  gameRootsSystemDef, GameRootsSystem
} from './system.ts';

export type Backend = {
  files: data.simpleSystem.Components<FileSystem>,
  roots: data.simpleSystem.Components<GameRootsSystem>,
};

export const createBackend = (
  world: data.simpleSystem.World
): Backend => {
  const files = data.simpleSystem.createComponents<FileSystem>(world, {
    definition: fileSystemDef,
    service: {
      calculateKey: (item) => ({
        part: item.gameId,
        sort: item.id
      }),
      update: (previous, input) => ({
        ...previous,
        name: input.name || previous.name,
        content: input.content || previous.content,
      }),
      create: (input) => ({
        ...input,
        id: nanoid(),
      }),
    },
  });
  const roots = data.simpleSystem.createComponents<GameRootsSystem>(world, {
    definition: gameRootsSystemDef,
    service: {
      calculateKey(input) {
        return { part: input.gameId, sort: input.userId };
      },
      create(input) {
        return input;
      },
      update(input) {
        throw new Error();
      },
    }
  });
  
  return {
    files,
    roots,
  }
}