
import { DocSheet, markdownToSheet } from '../ComponentDoc/mod.ts';

// @deno-types="vite-text"
import readme from './readme.md?raw';
import { OrbitSceneCanvas } from './OrbitSceneCanvas.ts';
import { act, three, actThree } from './deps.ts';
const { h } = act;

const geometry = new three.BoxGeometry(10, 10, 10);
const material = new three.MeshStandardMaterial({ color: 'red' })

console.log('demo')
const OrbitSceneCanvasDemo = () => {
  console.log('demo')
  act.useEffect(() => {
    console.log('up');
    return () => {
      console.log('down');
    }
  });
  return h(OrbitSceneCanvas, {}, [
    h(actThree.mesh, { position: new three.Vector3(0, 0, 0), geometry, material }),
    h(actThree.ambientLight, { color: new three.Color('grey') }),
    h(actThree.directionalLight, { color: new three.Color('white') }),
  ])
}

const demos = {
  'orbit_scene_canvas': OrbitSceneCanvasDemo
}

export const threeCommonDocDocs: DocSheet[] = [
  markdownToSheet('ThreeCommonDoc', readme, demos)
]