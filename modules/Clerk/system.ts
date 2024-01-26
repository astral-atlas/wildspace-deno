import { data, m } from "./deps.ts";
import { fileItemDef, fileContentDef } from "./models.ts";

export const fileSystemDef = {
  key: 'clerk/files',
  models: {
    resource: fileItemDef,
    create: m.object({
      gameId: m.string,
      content: fileContentDef,
      parentId: m.nullable(m.string),
      name: m.string,
    }),
    update: m.object({
      name: m.nullable(m.string),
      content: m.nullable(fileContentDef),
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

export const gameRootsSystemDef = {
  key: 'clerk/roots',
  models: {
    resource: m.object({
      gameId: m.string,
      userId: m.string,
      fileId: m.string,
    }),
    create: m.object({
      gameId: m.string,
      userId: m.string,
      fileId: m.string,
    }),
    update: m.literal(null),
  },
  names: {
    partition: 'gameId',
    sort: 'userId',
    resource: 'root',
  }
} as const;

export type GameRootsSystem = data.simpleSystem.TypeOfSimpleSystem<
  typeof gameRootsSystemDef
>;