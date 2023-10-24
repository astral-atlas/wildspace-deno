import { channel, m, storage } from "../deps.ts";

export type World = {
  partitionStorageProvider: PartitionStorageProvider,
  channelProvider: ChannelProvider,
};

export type PartitionStorageProvider = {
  createPartitionClient<T extends storage.DynamoPartitionType>(
    key: string,
    definition: storage.DynamoPartitionDefinition<T>,
  ): storage.DynamoPartitionClient<T>
}

export type ChannelProvider = {
  createEchoChannel<Message extends m.ModeledType>(
    key: string,
    messageModel: m.ModelOf2<Message>,
  ): channel.UniformChannel<Message>,

  createEchoBand<T extends channel.BandType>(
    key: string,
    messageModel: m.ModelOf2<T["message"]>,
    hashDial: (dial: T["dial"]) => string,
  ): channel.Band<T>,
}

export type MemoryWorld = {
  partitionStorageProvider: PartitionStorageProvider,
  channelProvider: ChannelProvider,

  partitions: Map<string, storage.DynamoMemoryStore<any>>,
  echoChannels: Map<string, channel.UniformChannel<any>>,
  echoBands: Map<string, channel.Band<any>>,
};


export const createMemoryWorld = (): MemoryWorld => {
  const partitions = new Map<string, storage.DynamoMemoryStore<any>>();
  const partitionStorageProvider: PartitionStorageProvider = {
    createPartitionClient(key, definition) {
      const client = partitions.get(key) || storage.createMemoryDynamoStore(definition);
      partitions.set(key, client);
      return client;
    }
  };
  const echoChannels = new Map<string, channel.UniformChannel<any>>();
  const echoBands = new Map<string, channel.Band<any>>();

  const channelProvider: ChannelProvider = {
    createEchoChannel(key, _) {
      const client = echoChannels.get(key) || channel.createEchoChannel();
      echoChannels.set(key, client);
      return client;
    },
    createEchoBand(key, _, hashDial) {
      const client = echoBands.get(key) || channel.createMemoryBand(hashDial);
      echoBands.set(key, client);
      return client;
    },
  };
  return {
    partitionStorageProvider,
    channelProvider,

    partitions,
    echoChannels,
    echoBands,
  }
};