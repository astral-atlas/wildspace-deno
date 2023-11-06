import { channel, m, storage } from "../ServiceCommon/deps.ts";

export type World = {
  partitionStorageProvider: PartitionStorageProvider,
  channelProvider: ChannelProvider,
  blobStorageProvider: BlobStorageProvider,
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

export type BlobStorageProvider = {
  createBlobStorage(partition: string): storage.BlobStreamService,
};

export type MemoryWorld = World & {
  partitions: Map<string, storage.DynamoMemoryStore<any>>,
  echoChannels: Map<string, channel.UniformChannel<any>>,
  echoBands: Map<string, channel.Band<any>>,
  blobStores: Map<string, storage.BlobStreamMemoryService>
};


export const createMemoryWorld = (): MemoryWorld => {
  const partitions = new Map<string, storage.DynamoMemoryStore<any>>();
  const partitionStorageProvider: PartitionStorageProvider = {
    createPartitionClient(key, definition) {
      const client = partitions.get(key)
        || storage.createMemoryDynamoStore(definition);
      partitions.set(key, client);
      return client;
    }
  };
  const echoChannels = new Map<string, channel.UniformChannel<any>>();
  const echoBands = new Map<string, channel.Band<any>>();

  const channelProvider: ChannelProvider = {
    createEchoChannel(key, _) {
      const client = echoChannels.get(key)
        || channel.createEchoChannel();
      echoChannels.set(key, client);
      return client;
    },
    createEchoBand(key, _, hashDial) {
      const client = echoBands.get(key)
        || channel.createMemoryBand(hashDial);
      echoBands.set(key, client);
      return client;
    },
  };

  const blobStores = new Map<string, storage.BlobStreamMemoryService>();
  const blobStorageProvider = {
    createBlobStorage(partition: string) {
      const blob = blobStores.get(partition)  
        || storage.createMemoryBlobStreamService();
      blobStores.set(partition, blob);
      return blob;
    }
  }

  return {
    partitionStorageProvider,
    channelProvider,
    blobStorageProvider,

    partitions,
    echoChannels,
    echoBands,
    blobStores,
  }
};