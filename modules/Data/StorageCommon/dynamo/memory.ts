import { Observable, Subject } from "https://esm.sh/rxjs@7.8.1";
import { DynamoPartitionKey } from "./mod.ts";
import {
DynamoKey,
  DynamoPartitionClient,
  DynamoPartitionDefinition,
  DynamoPartitionType,
} from "./partition.ts";
import { rxjs } from "../../SesameDataService/deps.ts";

export type DynamoMemoryStoreExtension<T extends DynamoPartitionType> = {
  memory(): MemoryStoreItem<T>[],
  onMemoryUpdate: Subject<MemoryStoreItem<T>[]>,
}
export type DynamoMemoryStore<T extends DynamoPartitionType> =
  DynamoPartitionClient<T> & DynamoMemoryStoreExtension<T>; 
export type MemoryStoreItem<T extends DynamoPartitionType> = {
  value: T["value"],
  key: DynamoKey<T>
}

export const createMemoryDynamoStore = <T extends DynamoPartitionType>(
  definition: DynamoPartitionDefinition<T>,
): DynamoMemoryStore<T> => {
  let allItems: MemoryStoreItem<T>[] = [];
  let operations = [];

  const isKeyEqual = (keyA: DynamoKey<T>, keyB: DynamoKey<T>) => {
    return keyA.part === keyB.part && keyA.sort == keyB.sort
  }
  const onMemoryUpdate = new rxjs.Subject<MemoryStoreItem<T>[]>();

  const memory = () => {
    return [...allItems]
      .sort((a, b) => (a.key.sort as string).localeCompare(b.key.sort));
  }

  return {
    definition,
    onMemoryUpdate,
    memory,
    put(key, value) {
      const item = {
        value,
        key,
      } as MemoryStoreItem<T>;
      allItems = [item, ...allItems.filter(i => !isKeyEqual(i.key, key))];
      operations.push({ type: 'put', key, value })
      onMemoryUpdate.next(memory());
      return Promise.resolve();
    },
    delete(key) {
      const item = allItems.find(item => isKeyEqual(item.key, key));
      allItems = allItems.filter(i => item !== i);
      operations.push({ type: 'delete', key })
      onMemoryUpdate.next(memory());
      if (!item)
        throw new Error();
      return Promise.resolve(item.value);
    },
    get(key) {
      const item = allItems.find(item => isKeyEqual(item.key, key));

      operations.push({ type: 'get', key })
      if (!item)
        return Promise.reject()
      return Promise.resolve(item.value);
    },
    async query(query) {
      operations.push({ type: 'query', query })
      switch (query.type) {
        case 'all':
          return allItems
            .filter(item => item.key.part === query.part)
        case 'equal':
          return allItems
            .filter(item => isKeyEqual(item.key, query));
        default:
          throw new Error('Unimplemented');
      }
    },
  };
};
