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
}> = ({ name, store }) => {
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

  return h(big.BigTable, {
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
        ...Object.values(item.value).map((v) => v?.toString() || "null"),
      ];
    }),
  });
};
