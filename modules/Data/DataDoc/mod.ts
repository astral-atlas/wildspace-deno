import { rxjs } from "../SesameDataService/deps.ts";
import { act, big, storage, m, actCommon } from "./deps.ts";
const { h, useState, useEffect } = act;
const { useSelector, isArrayEqual } = actCommon;

type AnyType = { part: any; sort: any; value: any };

type AnyTypeNoPart = { part?: undefined; sort: any; value: any };
export type AnyMemoryClient =
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
  const items = useSelector({
    retrieve: () => store.memory(),
    changes: store.onMemoryUpdate,
  }, s => s, [], isArrayEqual)

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

export * from './SystemComponentsPreview.ts';