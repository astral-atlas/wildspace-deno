import { h, useState } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { componentDoc, three } from "./deps.ts";

// @deno-types="vite-text"
import readme from './readme.md?raw';
import { OrbitSceneCanvas } from "../ThreeCommonDoc/mod.ts";
import { GlitchMesh, glitchNames } from "./GlitchMesh.ts";

const GlitchMeshDemo = () => {
  const [i, setI] = useState(0);
  const [s, setS] = useState(0);
  const onInput = (e: InputEvent) => {
    if (e.target instanceof HTMLInputElement)
      setI(Number.parseInt(e.target.value));
  }
  const onSelect = (e: InputEvent) => {
    if (e.target instanceof HTMLSelectElement) {
      console.log('seting')
      setS(Number.parseInt(e.target.value));
    }
  }
  const boundedI = Math.abs(i % 16);
  console.log({ s })
  return [
    h('input', { type: 'number', onInput, value: i }),
    h('select', { onInput: onSelect }, glitchNames.map((name, index) =>
      h('option', { selected: s === index, value: index }, name))),
    
    h(OrbitSceneCanvas, {}, [
      h(GlitchMesh, {
        tile: new three.Vector2(boundedI % 4, Math.floor(boundedI / 4)),
        state: glitchNames[s],
      })
    ])
  ]
};

const demos = {
  'glitch-mesh': GlitchMeshDemo
}

export const effectsCommonDocs: componentDoc.DocSheet[] = [
  componentDoc.markdownToSheet('EffectsCommon', readme, demos)
]