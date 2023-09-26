import { rxjs } from "../SesameDataService/deps.ts";
import { act, big, storage } from "./deps.ts";
const { h, useState, useEffect } = act;

type AnyType = { part: any; sort: any; value: any };

type AnyTypeNoPart = { part?: undefined; sort: any; value: any };
type AnyMemoryClient =
  | (storage.DynamoPartitionClient<AnyType> &
      storage.DynamoMemoryStoreExtension<AnyType>)
  | (storage.DynamoPartitionClient<AnyTypeNoPart> &
      storage.DynamoMemoryStoreExtension<AnyTypeNoPart>);

export const StoreVisualzer: act.Component<{
  name: string;
  store: AnyMemoryClient;
  height?: number,
}> = ({ name, store, height }) => {
  type Item = storage.MemoryStoreItem<storage.DynamoPartitionType>;

  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    setItems(store.memory());
    const observer = store.onMemoryUpdate as rxjs.Observable<Item[]>;
    const sub = observer.subscribe((items) => {
      setItems(items);
    });
    return () => sub.unsubscribe();
  }, []);

  return h('div', { style: { maxHeight: height || '400px', height, overflow: 'auto' } }, h(big.BigTable, {
    heading: h("h3", {}, name),
    columns: [
      "PartitionKey",
      "SortKey",
      ...Object.keys(store.definition.model.properties),
    ],
    rows: items.map((item) => {
      return [
        item.key.part || "",
        item.key.sort,
        ...Object.keys(store.definition.model.properties).map(key => {
          const value = item.value[key];
          if (typeof value === "object") {
            return JSON.stringify(value).slice(0, 100);
          }
          if (!value) {
            return null;
          }
          return value.toString().slice(0, 100);
        }),
      ];
    }),
  }));
};
