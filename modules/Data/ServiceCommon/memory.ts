// @ts-nocheck
import { DynamoMemoryStoreExtension } from "../StorageCommon/mod.ts";
import {
  CommonSystemComponents,
  CommonSystemDefinintion,
  CommonSystemType,
  createCommonSystemChannels,
  createCommonSystemService,
  createCommonSystemStoreDefinition,
} from "./commonSystem.ts";
import { channel, storage } from "./deps.ts";
import { CommonSystemServiceImplementation } from "./mod.ts";

export const createMemoryChannels = <T extends CommonSystemType>(
  definition: CommonSystemDefinintion<T>,
  implementation: CommonSystemServiceImplementation<T>,
) => {
  const [outgoing, incoming] = createCommonSystemChannels<T>(
    channel.createEchoChannel(),
    definition,
    implementation.calculateKey
  );
  return {
    changes: incoming,
    channel: outgoing,
  }
};
export const createMemoryStore = <T extends CommonSystemType>(definition: CommonSystemDefinintion<T>) => {
  return storage.createMemoryDynamoStore(
    createCommonSystemStoreDefinition<T>(definition)
  );
}

export const createMemoryCommonSystemComponents = <T extends CommonSystemType>(
  definition: CommonSystemDefinintion<T>,
  memoryImplementation: {
    create: (input: T["editable"]) => T["resource"],
    update: (resource: T["resource"], input: T["editable"]) => T["resource"],
    calculateKey: (input: T["resource"]) => { part: string, sort: string },
  }
): CommonSystemComponents<T> & { memory: { storage: storage.DynamoPartitionClient<any> & DynamoMemoryStoreExtension<any> }} => {
  const systemStore = storage.createMemoryDynamoStore(
    createCommonSystemStoreDefinition<T>(definition)
  );
  const [outgoing, incoming] = createCommonSystemChannels<T>(
    channel.createEchoChannel(),
    definition,
    memoryImplementation.calculateKey
  );
  const systemService = createCommonSystemService({
    storage: systemStore,
    channel: outgoing,
    definition,
    implementation: memoryImplementation
  });

  return {
    storage: systemStore,
    service: systemService,
    changes: incoming,
    channel: outgoing,
    memory: { storage: systemStore }
  }
};
