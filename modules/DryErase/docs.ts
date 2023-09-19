import { DocSheet } from "../ComponentDoc/DocElement.ts";
import { markdownToSheet } from "../ComponentDoc/markdown.ts";
import { WhiteboardView } from "./components.ts";
import { act, channel, service, nanoid, storage } from "./deps.ts";
const { h, useState, useEffect } = act;

// @deno-types="vite-text"
import readme from "./readme.md?raw";
import { BigTable } from "../BigTable/BigTable.ts";
import { WhiteboardTypes, systems } from "./service.ts";
import { createWhiteboardServerChannel } from "./channel.ts";
import { StoreVisualzer } from "../Data/DataDoc/mod.ts";
import { WhiteboardEditor } from "./components/WhiteboardEditor.ts";
import { FramePresenter } from "../ComponentDoc/FramePresenter.ts";

const Provider: act.Component = ({ children }) => {
  return children;
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
  const [host, error] = useAsync(async () => {
    const cursor = service.createMemoryCommonSystemComponents<WhiteboardTypes["cursorSystem"]>(systems.cursor, {
      calculateKey: i => ({ part: i.whiteboardId, sort: i.id }),
      create: i => ({ ...i, id: nanoid() }),
      update: (p, i) => ({ ...p, ...i })
    })
    const stroke = service.createMemoryCommonSystemComponents<WhiteboardTypes["strokeSystem"]>(systems.stroke, {
      calculateKey: i => ({ part: i.whiteboardId, sort: i.id }),
      create: i => ({ ...i, id: nanoid() }),
      update: (p, i) => ({ ...p, ...i })
    })
    const backend = {
      cursor: cursor.service,
      stroke: stroke.service
    };
    const left = await createWhiteboardServerChannel('left', 'board-id', backend, cursor.changes, stroke.changes)
    const right = await createWhiteboardServerChannel('right', 'board-id', backend, cursor.changes, stroke.changes)
    return { left, right, cursor, stroke };
  }, []);

  if (error)
    console.error(error)
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
    h(StoreVisualzer, { name: 'Cursor', store: host.cursor.memory.storage as any }),
    h(StoreVisualzer, { name: 'Stroke', store: host.stroke.memory.storage as any })
  ];
};
const WhiteboardEditorDemo = () => {
  return h(FramePresenter, {}, h(WhiteboardEditor));
};
const components = {
  demo: Demo,
  whiteboardEditorDemo: WhiteboardEditorDemo
};

export const dryEraseDocs: DocSheet[] = [
  markdownToSheet("DryErase", readme, components, Provider),
];
