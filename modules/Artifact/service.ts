import { m, service } from "./deps.ts";
import { AssetID } from "./models.ts";

const assetSystem = {
  names: ['artifact', 'asset'],
  partName: 'ownerId',
  sortName: 'assetId',
  editable: m.object({}),
  resource: m.object({})
} as const;
service.assertIsSystem(assetSystem);

export const systems = {
  asset: assetSystem,
};

type Systems = {
  asset: service.ToCommonSystemType<typeof assetSystem>,
};
type Meta = {
  "Components": {
    asset: service.CommonSystemComponents<Systems["asset"]>,
  }
};

export type ArtifactService = {
  assets: Meta["Components"]["asset"]["service"],
};

export type URLService = {
  createDownloadURL: (asset: AssetID) => Promise<URL>,
  createUploadURL: (asset: AssetID) => Promise<URL>,
};

/**
 * Create a URL service that returns URLS
 * from the current machine.
 */
export const createLocalURLService = (host: string): URLService => {
  const createDownloadURL = async (assetId: AssetID) => {
    const url = new URL('/artifact/bytes', host);
    url.search = new URLSearchParams({ assetId }).toString();
    return url;
  };
  const createUploadURL = async (assetId: AssetID) => {
    const url = new URL('/artifact/bytes', host);
    url.search = new URLSearchParams({ assetId }).toString();
    return url;
  }
  return { createDownloadURL, createUploadURL }
}