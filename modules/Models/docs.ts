import { DocSheet, markdownToSheet } from "../ComponentDoc/mod.ts";
import { act } from '../AtlasRenderer/mod.ts';

// @deno-types="vite-text"
import readme from './readme.md?raw';
import * as m from './mod.ts';

const { h } = act;

const BinaryDemo = () => {
  const model = m.object({
    type: m.string,
    count: m.number,
    oneOrTheOther: m.set(['hey', 'yo'] as const)
  })
  const original = {
    type: 'hello',
    count: 2345325.3455243,
    oneOrTheOther: 'hey'
  }
  const serializer = m.createBinarySerializer(model);
  const bin = serializer.encode(original)
  const deserialized = serializer.decode(bin)

  return [
    h('pre', {}, JSON.stringify({ original }, null, 2)),
    h('pre', {}, JSON.stringify([...bin])),
    h('pre', {}, JSON.stringify({ deserialized }, null, 2)),
  ]
}

const components = {
  BinaryDemo
}

export const modelDocs: DocSheet[] = [
  markdownToSheet('Model', readme, components)
]