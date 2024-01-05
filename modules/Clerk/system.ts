import { data, m } from "./deps.ts";
import { directoryItemDef, fileItemDef, gameItemRef } from "./models.ts";

export const fileSystemDef = {
  key: 'clerk/files',
  models: {
    resource: fileItemDef,
    create: m.object({
      gameId: m.string,
      content: gameItemRef,
      parentDirectoryId: m.string,
    }),
    update: m.object({
      parentDirectoryId: m.string,
    }),
  },
  names: {
    partition: 'gameId',
    sort: 'fileId',
    resource: 'fileItem',
  }
} as const;

export type FileSystem = data.simpleSystem.TypeOfSimpleSystem<
  typeof fileSystemDef
>;

export const directorySystemDef = {
  key: 'clerk/directories',
  models: {
    resource: directoryItemDef,
    create: m.object({
      gameId: m.string,
      name: m.string,
      parentDirectoryId: m.string,
    }),
    update: m.object({
      name: m.string,
      parentDirectoryId: m.string,
    }),
  },
  names: {
    partition: 'gameId',
    sort: 'directoryId',
    resource: 'directoryItem',
  }
} as const;

export type DirectorySystem = data.simpleSystem.TypeOfSimpleSystem<
  typeof directorySystemDef
>;
