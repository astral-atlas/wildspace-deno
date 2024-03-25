import { doc, h, PackageDoc } from "../ComponentDoc/mod.ts";
import { useAnimation } from "../FrameScheduler/useAnimation.ts";
import * as threeDoc from '../ThreeCommonDoc/mod.ts';
import { act, actThree, three } from "./deps.ts";
import * as mod from './mod.ts';
import pkg from './package.json';

const { useRef } = act;

const DragRotateDemo = () => {
  const rootRef = useRef<null | HTMLElement>(null);
  const meshRef = useRef<null | three.Mesh>(null);
  const rotation = useRef(new three.Euler()).current;

  mod.useUprightDragRotate(rootRef, rotation);
  useAnimation('spin', () => {
    if (meshRef.current)
      meshRef.current.rotation.copy(rotation);
  }, [])

  return h(threeDoc.OrbitSceneCanvas, { distance: 5, overrides: { rootRef }, speed: 0 }, [
    h(actThree.mesh, {
      ref: meshRef,
      geometry: new three.BoxGeometry(1, 1, 1),
      material: new three.MeshStandardMaterial({ color: 'red' })
    })
  ]);
}

doc({
  id: 'ThreeCommon',
  readmeURL: new URL('./readme.md', import.meta.url),
  directiveComponents: { pkg: () => h(PackageDoc, { pkg }), DragRotateDemo }
})