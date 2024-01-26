import { m } from "./deps.ts";

export const fileContentDef = m.union2([
  m.object({
    type: m.literal('asset'),
    assetId: m.nullable(m.string),
  }),
  m.object({
    type: m.literal('directory'),
    children: m.array(m.string),
  }),
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
