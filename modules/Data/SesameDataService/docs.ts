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

import { MarkdownDirectiveComponentProps, ComponentMap } from "https://esm.sh/@lukekaalim/act-markdown@1.8.0";

const demoContext = createContext<{
  store: MemorySesameStore,
  output: string | null,
  setOutput: (output: null | string) => void
} | null>(null);
const useDemoContext = () => {
  const context = useContext(demoContext);
  if (!context)
    throw new Error();
  return context;
}
const DemoContextProvider: act.Component = ({ children }) => {
  const store = useRef(createMemorySesameStore()).current;
  const [output, setOutput] = useState<null | string>(null)

  return h(demoContext.Provider, { value: { store, output, setOutput } }, children);
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

const demos: ComponentMap<MarkdownDirectiveComponentProps> = {
  service_action({ node }) {
    const { store, setOutput } = useDemoContext();
    const sesame = useRef(createStoredSesameDataService(store, { type: 'guest' })).current;

    const actions = {
      async userCreate() {
        setOutput(JSON.stringify(
          await sesame.user.create({
            name: 'luke',
            password: 'secret'
          }),
          null,
          2
        ))
      },
      async userRead() {
        setOutput(JSON.stringify(
          await sesame.user.read({ id: store.users.memory()[0].value.id }),
          null,
          2
        ))
      }
    } as Record<string, () => unknown>;
    const attributes = node.attributes as Record<string, string>;
    const name = attributes["name"];
    const onClick = actions[name] || (() => {});

    return h('button', { onClick }, name);
  },
  store_demo: StoreDemo,
  output() {
    const { output, setOutput } = useDemoContext();

    return [
      h('button', { onClick() { setOutput(null) } }, 'Clear output'),
      h('pre', {}, output || "[No output]")
    ];
  }
};

export const sesameDataServiceDocs: DocSheet[] = [
  markdownToSheet("SesameDataService", readme, demos, DemoContextProvider, 'Sesame'),
];
