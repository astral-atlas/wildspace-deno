import { m } from "./deps.ts";

export const directoryFileContent = m.object({
  type: m.literal('directory'),
  children: m.array(m.string),
});
export const assetFileContent = m.object({
  type: m.literal('asset'),
  assetId: m.nullable(m.string),
})

export type FileContentByName = {
  directory: m.OfModelType<typeof directoryFileContent>,
  asset: m.OfModelType<typeof assetFileContent>,
}

export const fileContentDef = m.union2([
  directoryFileContent,
  assetFileContent
] as const);
export type FileContent = m.OfModelType<typeof fileContentDef>;

export const fileItemDef = m.object({
  gameId: m.string,
  id: m.string,
  parentId: m.nullable(m.string),
  name: m.string,
  content: fileContentDef,
});
export type FileItem = m.OfModelType<typeof fileItemDef>;
export type FileItemID = string;

export type FileItemT<A extends keyof FileContentByName> = FileItemC<FileContentByName[A]>;
export type FileItemC<Content extends FileContent = FileContent> =
  & FileItem
  & { content: Content }