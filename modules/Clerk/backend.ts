import { data, nanoid } from "./deps.ts";
import {
  fileSystemDef, FileSystem,
  directorySystemDef, DirectorySystem
} from './system.ts';

export type Backend = {
  files: data.simpleSystem.Components<FileSystem>,
  directories: data.simpleSystem.Components<DirectorySystem>,
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
        ...input,
      }),
      create: (input) => ({
        ...input,
        id: nanoid(),
      }),
    },
  });
  const directories = data.simpleSystem.createComponents<DirectorySystem>(world, {
    definition: directorySystemDef,
    service: {
      calculateKey: (item) => ({
        part: item.gameId,
        sort: item.id
      }),
      update: (previous, input) => ({
        ...previous,
        ...input,
      }),
      create: (input) => ({
        ...input,
        id: nanoid(),
      }),
    },
  });
  return {
    files,
    directories,
  }
}