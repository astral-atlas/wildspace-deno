import { m } from "./deps.ts";

export const gameItemRef = m.union2([
  m.object({
    type: m.literal('asset'),
    assetId: m.string,
  }),
] as const);
export type GameItemRef = m.OfModelType<typeof gameItemRef>;

export const fileItemDef = m.object({
  gameId: m.string,
  id: m.string,
  content: gameItemRef,
});
export type FileItem = m.OfModelType<typeof fileItemDef>;

export const itemRef = m.union2([
  m.object({
    type: m.literal('file'),
    fileId: m.string,
  }),
  m.object({
    type: m.literal('directory'),
    directoryId: m.string,
  }),
] as const);

export const directoryItemDef = m.object({
  gameId: m.string,
  id: m.string,

  name: m.string,
  children: m.array(itemRef),
});
export type DirectoryItem = m.OfModelType<typeof directoryItemDef>;

