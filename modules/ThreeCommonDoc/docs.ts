import { mesh, h, ambientLight, Color, directionalLight } from './deps.ts';

import { DocSheet, markdownToSheet } from '../ComponentDoc/mod.ts';

// @deno-types="vite-text"
import readme from './readme.md?raw';
import { OrbitSceneCanvas } from './OrbitSceneCanvas.ts';
import { Vector3, BoxGeometry, MeshStandardMaterial } from './deps.ts';

const geometry = new BoxGeometry(10, 10, 10);
const material = new MeshStandardMaterial({ color: 'red' })

const OrbitSceneCanvasDemo = () => {
  return h(OrbitSceneCanvas, {}, [
    h(mesh, { position: new Vector3(0, 0, 0), geometry, material }),
    h(ambientLight, { color: new Color('grey') }),
    h(directionalLight, { color: new Color('white') }),
  ])
}

const demos = {
  'orbit_scene_canvas': OrbitSceneCanvasDemo
}

export const threeCommonDocDocs: DocSheet[] = [
  markdownToSheet('ThreeCommonDoc', readme, demos)
]