import {
  DynamoPartitionClient,
  DynamoPartitionDefinition,
  DynamoPartitionType,
} from "./partition.ts";

export const createMemoryDynamoStore = <T extends DynamoPartitionType>(
  definition:
    & Pick<DynamoPartitionDefinition<T>, 'partitionKey'>
    & Pick<DynamoPartitionDefinition<T>, 'sortKey'>,
): DynamoPartitionClient<T> & {
  memory: () => T["value"][];
} => {
  type Item = { value: T["value"], pk: string, sk: string }
  let allItems: Item[] = [];

  return {
    memory() {
      return allItems.map(i => i.value);
    },
    put(value) {
      const item = {
        value,
        pk: value[definition.partitionKey],
        sk: value[definition.sortKey]
      } as Item;
      allItems = [item, ...allItems];
      return Promise.resolve();
    },
    query(partition, sort) {
      const items = allItems
        .filter(
          (item) => item.value[definition.partitionKey] === partition
            && (!sort || item.value[definition.sortKey] === sort)
        )
        .map(item => item.value);
      return Promise.resolve({ items });
    },
  };
};
