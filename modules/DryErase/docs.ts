import { DocSheet } from "../ComponentDoc/DocElement.ts";
import { markdownToSheet } from "../ComponentDoc/markdown.ts";
import { WhiteboardView } from "./components.ts";
import { act, channel, service, nanoid, storage } from "./deps.ts";

// @deno-types="vite-text"
import readme from "./readme.md?raw";
import { BigTable } from "../BigTable/BigTable.ts";
import { WhiteboardTypes, createBackend, createInsecureImplementation, createMemoryDeps } from "./service.ts";
import { createWhiteboardServerChannel } from "./channel.ts";
import { StoreVisualzer } from "../Data/DataDoc/mod.ts";
import { WhiteboardEditor } from "./components/WhiteboardEditor.ts";
import { FramePresenter } from "../ComponentDoc/FramePresenter.ts";

const { h, useState, useEffect, createContext, useContext } = act;

const hostContext = createContext<ReturnType<typeof useHost>>(null);

const useHost = () => {
  const [host, error] = useAsync(async () => {
    const implementation = createInsecureImplementation("Me!");
    const backendDeps = createMemoryDeps(implementation);
    const backend = createBackend(backendDeps, implementation);

    const left = await createWhiteboardServerChannel('left', 'board-id', backend);
    const right = await createWhiteboardServerChannel('right', 'board-id', backend);
    return { left, right, backend, backendDeps };
  }, []);

  if (error)
    console.error(error)

  return host;
}

const Provider: act.Component = ({ children }) => {
  const host = useHost()
  return h(hostContext.Provider, { value: host }, children);
};
const ChannelView: act.Component<{
  channel: channel.BidirectionalChannel<unknown, unknown>;
}> = ({ channel }) => {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    channel.recieve.subscribe(message => {
      setMessages(m => [JSON.stringify(Object.values(message)) || '', ...m].slice(0, 10))
    })
  }, []);

  return h(BigTable, {
    columns: ['message'],
    containerStyle: { height: `200px` },
    rows: messages
      .map(m => [m.length > 100 ? m.slice(0, 100) + '...' : m])
  })
};
const useAsync = <T>(func: () => Promise<T>, deps: act.Deps = []): [T | null, unknown | null] => {
  const [resolution, setResolution] = useState<T | null>(null);
  const [rejection, setRejection] = useState<unknown | null>(null);
  useEffect(() => {
    func()
      .then(setResolution)
      .catch(setRejection)
  }, deps);

  return [resolution, rejection]
}
const Demo: act.Component = () => {
  const host = useContext(hostContext);
  if (!host)
    return 'Loading';

  return [
    h('div', { style: { display: 'flex' } }, [
      h('div', { style: { border: '1px solid black', display: 'flex', flex: 1 } }, [
        h(WhiteboardView, { channel: host.left }),
      ]),
      h('div', { style: { border: '1px solid black', display: 'flex', flex: 1 } }, [
        h(WhiteboardView, { channel: host.right }),
      ]),
    ]),
    h(ChannelView, { channel: host.left as channel.BidirectionalChannel<unknown, unknown> }),
    h(StoreVisualzer, { name: 'Cursor', store: host.backendDeps.cursor.memoryStore }),
    h(StoreVisualzer, { name: 'Cursor', store: host.backendDeps.note.memoryStore }),
  ];
};
const WhiteboardEditorDemo = () => {
  const host = useContext(hostContext);
  if (!host)
    return 'Loading';

  return h(FramePresenter, {}, h(WhiteboardEditor, { channel: host.left }));
};
const components = {
  demo: Demo,
  whiteboardEditorDemo: WhiteboardEditorDemo
};

export const dryEraseDocs: DocSheet[] = [
  markdownToSheet("DryErase", readme, components, Provider),
];
