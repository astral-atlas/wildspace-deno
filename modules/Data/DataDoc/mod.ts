import { rxjs } from "../SesameDataService/deps.ts";
import { act, big, storage, m } from "./deps.ts";
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
  style?: { [key: string]: string }
}> = ({ name, store, height, style }) => {
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

  const getModelProperties = (model: m.Model): { [key: string]: m.Model } => {
    switch (model.type) {
      case 'object':
        return model.properties;
      case 'meta':
        return getModelProperties(model.value);
      default:
        return {};
    }
  }
  const properties = getModelProperties(store.definition.model);

  return h('div', { style: { maxHeight: height || '400px', height, overflow: 'auto' } },
    h(big.BigTable, {
      containerStyle: style,
      heading: h("h3", {}, name),
      columns: [
        "PartitionKey",
        "SortKey",
        ...Object.keys(properties),
      ],
      rows: items.map((item) => {
        return [
          item.key.part || "",
          item.key.sort,
          ...Object.keys(properties).map(key => {
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
    })
  );
};
