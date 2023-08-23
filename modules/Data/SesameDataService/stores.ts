import { m } from "../NetworkCommon/deps.ts";
import { models, rxjs, storage } from "./deps.ts";

export type SesameStoreTypes = {
  apps: {
    value: models.SesameApp,
    part: models.SesameUserID
    sort: models.SesameAppID,
  };
  users: {
    value: models.SesameUser,
    sort: models.SesameUserID,
  },
  userNamesById: {
    value: { userId: string },
    sort: models.SesameUser["name"],
  },
  secrets: {
    value: models.SesameSecret,
    sort: models.SesameSecretID,
  },
}

const storeDefinitions = {
  apps: {
    partitionPrefix: "apps",
    model: models.appDefinition
  },
  users: {
    partitionPrefix: "users",
    model: models.userDefinition
  },
  userNamesById: {
    partitionPrefix: "userNamesById",
    model: m.object({ userId: m.string })
  },
  secrets: {
    partitionPrefix: "secrets",
    model: models.secretDefinition
  },
} as const;

export type SesameStores = {
  apps: storage.DynamoPartitionClient<SesameStoreTypes["apps"]>,
  users: storage.DynamoPartitionClient<SesameStoreTypes["users"]>,
  userNamesById: storage.DynamoPartitionClient<SesameStoreTypes["userNamesById"]>,

  secrets: storage.DynamoPartitionClient<SesameStoreTypes["secrets"]>,

  userEvents: rxjs.Subject<{ user: models.SesameUser }>,
}

export type MemorySesameStore = {
  [key in keyof SesameStores]:
    SesameStores[key] extends storage.DynamoPartitionClient<infer X> ?
      storage.DynamoPartitionClient<X> & storage.DynamoMemoryStoreExtension<X>
    : SesameStores[key]
}

export const createMemorySesameStore = (): MemorySesameStore => {
  return {
    apps: storage.createMemoryDynamoStore(storeDefinitions.apps),
    users: storage.createMemoryDynamoStore(storeDefinitions.users),
    userNamesById: storage.createMemoryDynamoStore(storeDefinitions.userNamesById),
    secrets: storage.createMemoryDynamoStore(storeDefinitions.secrets),

    userEvents: new rxjs.Subject(),
  }
}