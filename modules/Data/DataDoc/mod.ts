import { act, big, storage } from "./deps.ts";
const { h, useState, useEffect } = act;

export const StoreVisualzer: act.Component<{
  name: string;
  store: storage.DynamoMemoryStoreExtension<storage.AnyDynamoPartitionType> &
    storage.DynamoPartitionClient<storage.AnyDynamoPartitionType>;
}> = ({ name, store }) => {
  const [items, setItems] = useState<
    storage.MemoryStoreItem<storage.DynamoPartitionType>[]
  >([]);
  useEffect(() => {
    setItems(store.memory());
    const sub = store.onMemoryUpdate.subscribe((items) => {
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
