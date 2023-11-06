import { m, network, simpleSystem } from "./deps.ts";
import { assetDefinition, assetUsageDefinition } from "./models.ts";

export const artifactSystemDef = {
  key: "artifact",
  names: {
    partition: "gameId",
    sort: "assetId",
    resource: "asset",
  },
  models: {
    resource: assetDefinition,
    create: m.object({
      uploader: m.string,
      gameId: m.string,
      contentType: m.string,
      contentLength: m.number,
      users: m.array(assetUsageDefinition),
    }),
    update: m.union2([
      m.object({ type: m.literal("add-user"), user: assetUsageDefinition }),
      m.object({
        type: m.literal("remove-user"),
        userId: assetUsageDefinition.properties.id,
      }),
      m.object({
        type: m.literal("complete-upload"),
      }),
    ]),
  },
} as const;
export type ArtifactSystem = simpleSystem.TypeOfSimpleSystem<
  typeof artifactSystemDef
>;

const postAssetDef = {
  path: "/asset",
  method: "POST",
  models: {
    request: m.object({
      gameId: m.string,
      contentType: m.string,
      contentLength: m.number,
    }),
    response: m.object({
      asset: assetDefinition,
      downloadURL: m.string,
      uploadURL: m.string,
    }),
    query: m.object({}),
  },
} as const;
const getAssetDef = {
  path: "/asset",
  method: "GET",
  models: {
    request: m.literal(null),
    response: m.object({
      asset: assetDefinition,
      downloadURL: m.string,
    }),
    query: m.object({
      gameId: m.string,
      assetId: m.string,
    }),
  },
} as const;
export const transactionDefs = {
  get: getAssetDef,
  post: postAssetDef,
};

export type Transactions = {
  get: network.OfTransactionType<typeof getAssetDef>;
  post: network.OfTransactionType<typeof postAssetDef>;
};
