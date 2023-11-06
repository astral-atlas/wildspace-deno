import { m } from "./deps.ts";

export const assetUsageDefinition = m.object({
  id: m.string,
  name: m.string,
});
export type AssetUsage = m.OfModelType<typeof assetUsageDefinition>;

export const assetIdDefinition = m.meta(m.string, { name: 'AssetID' });
export const assetDefinition = m.meta(m.object({
  id: assetIdDefinition,
  gameId: m.string,

  contentType: m.string,
  contentLength: m.number,

  createdAt: m.number,
  uploadedAt: m.nullable(m.number),
  uploadedBy: m.string,
  state: m.set(['pending', 'uploaded'] as const),
  
  users: m.array(assetUsageDefinition)
}), { name: 'Asset' });

export type Asset = m.OfModelType<typeof assetDefinition>;
export type AssetID = m.OfModelType<typeof assetIdDefinition>;

export const assetListDefinition = m.array(m.object({
  assetId: m.string,
  downloadURL: m.string,
}))
export type AssetList = m.OfModelType<typeof assetListDefinition>;