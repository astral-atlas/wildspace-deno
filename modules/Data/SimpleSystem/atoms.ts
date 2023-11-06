import { channel, m, storage } from "../ServiceCommon/deps.ts";
import {
  ChangeEvent,
  createChangeEventModel,
  UpdateBand,
  UpdateChannel,
} from "./update.ts";
import { createPartitionDefinition, DynamoPartitionType } from "./storage.ts";
import {
  SimpleSystemDefinition,
  SimpleSystemType,
} from "./system.ts";
import { World } from "./world.ts";

export type Atoms<T extends SimpleSystemType> = {
  store: storage.DynamoPartitionClient<DynamoPartitionType<T>>;
  channel: UpdateChannel<T>;
  band: channel.Band<UpdateBand<T>>;
};

export const createAtoms = <T extends SimpleSystemType>(
  world: World,
  definition: SimpleSystemDefinition<T>,
): Atoms<T> => {
  const storeDefinition = createPartitionDefinition(definition);
  const store = world.partitionStorageProvider.createPartitionClient(
    definition.key,
    storeDefinition,
  );

  const changeEventModel: m.ModelOf2<ChangeEvent<T>> = createChangeEventModel(definition);
  const channel = world.channelProvider.createEchoChannel<ChangeEvent<T>>(
    definition.key,
    changeEventModel,
  );

  const band = world.channelProvider.createEchoBand<UpdateBand<T>>(
    definition.key,
    changeEventModel,
    e => [e[definition.names.partition], e[definition.names.sort]]
      .filter(Boolean)
      .join(':')
  )

  return {
    store,
    channel,
    band,
  };
};
