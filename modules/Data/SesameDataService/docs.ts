import { createContext, h, useContext, useEffect, useRef, useState } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { markdownToSheet, DocSheet } from "../../ComponentDoc/mod.ts";

// @deno-types="vite-text"
import readme from "./readme.md?raw";
import { AnyDynamoPartitionType, DynamoPartitionClient, MemoryStoreItem, createMemoryDynamoStore } from "../StorageCommon/mod.ts";
import { createStoredSesameDataService } from "./mod.ts";
import { models } from "./deps.ts";
import { BigTable } from "../../BigTable/BigTable.ts";
import { FramePresenter } from "../../ComponentDoc/FramePresenter.ts";
import { act } from "../../EffectsCommon/deps.ts";
import { MemorySesameStore, createMemorySesameStore } from "./stores.ts";
import { DynamoMemoryStoreExtension, DynamoPartitionType } from "../StorageCommon/dynamo/mod.ts";
import { StoreVisualzer } from "../DataDoc/mod.ts";

const demoContext = createContext<{ store: MemorySesameStore } | null>(null);
const useDemoContext = () => {
  const context = useContext(demoContext);
  if (!context)
    throw new Error();
  return context;
}
const DemoContextProvider: act.Component = ({ children }) => {
  const store = useRef(createMemorySesameStore()).current;

  return h(demoContext.Provider, { value: { store }}, children);
};

const ServiceDemo = () => {
  const { store } = useDemoContext();
  const sesame = useRef(createStoredSesameDataService(store, { type: 'guest' })).current;

  const onClick = async () => {
    await sesame.user.create({
      name: "Luke",
      password: "secret"
    });
  };

  return h('button', { onClick }, [
    'Add user'
  ]);
};


const StoreDemo = () => {
  const { store } = useDemoContext();
  return [
    h(StoreVisualzer, { store: store.users, name: 'Users' }),
    h(StoreVisualzer, { store: store.apps, name: 'Apps' }),
    h(StoreVisualzer, { store: store.secrets, name: 'Secrets' }),
    h(StoreVisualzer, { store: store.userNamesById, name: 'Usernames' }),
  ];
};

const demos = {
  service_demo: ServiceDemo,
  store_demo: StoreDemo,
};

export const sesameDataServiceDocs: DocSheet[] = [
  markdownToSheet("SesameDataService", readme, demos, DemoContextProvider),
];
