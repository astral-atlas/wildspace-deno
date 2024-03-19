import {
  act, threeCommon, actThree, actCommon as ac,
  three,
  keyboard, deskplane, kayo,
} from "../deps.ts";
import { WizardAssetProps } from "./props.ts";
import { CrystalBall, CrystalBallPanel } from '../CrystalBall.ts';

// @deno-types="vite-css"
import styles from './ModelWizard.module.css';
import { formula } from "../deps.ts";

const { h, useRef, useEffect, useContext } = act;
const { useAsync } = ac;
const { useDraggableSurface2 } = deskplane;
const { keyboardStateControllerContext, useKeyboardElementRef } = keyboard;

export type ModelWizardProps = {
  content: Blob,
};

export const ModelWizard: act.Component<WizardAssetProps> = ({ content }) => {
  const sceneRef = useRef<threeCommon.three.Scene | null>(null);
  const cameraRef = useRef<threeCommon.three.PerspectiveCamera | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const selection = ac.useSelection<three.Object3D>();

  const gltf = useAsync(async () => {
    const loader = new threeCommon.gltf.GLTFLoader()

    return await loader.parseAsync(await content.arrayBuffer(), '')
  }, [content])

  useEffect(() => {
    if (!gltf)
      return;
    const canvasScene = sceneRef.current;
    if (!canvasScene)
      return;
    canvasScene.attach(gltf.scene);
    return () => {
      if (gltf.scene.parent === canvasScene)
        gltf.scene.removeFromParent()
    }
  }, [gltf])

  useKeyboardElementRef(rootRef)
  useKeyboardElementRef(canvasRef)
  const keyboard = useContext(keyboardStateControllerContext);
  const dragSurface = useDraggableSurface2(rootRef)

  useEffect(() => {
    const { current: camera } = cameraRef;
    if (!camera)
      return;

    let x = 0;
    let y = 0;
    
    dragSurface.onDragStart.subscribe(drag => {
      drag.changes.subscribe((move) => {
        if (move.type === 'move') {
          x += move.change.x / 500;
          y += move.change.y / 500;
        }
      });
    })

    const onAnimate = () => {
      camera.rotation.set(-y, -x, 0, 'YXZ');
      const forward = (keyboard.keysDown.has('KeyW') ? -1 : 0) + (keyboard.keysDown.has('KeyS') ? 1 : 0)
      const left = (keyboard.keysDown.has('KeyA') ? -1 : 0) + (keyboard.keysDown.has('KeyD') ? 1 : 0)

      camera.translateZ(forward/100)
      camera.translateX(left/100)

      id = requestAnimationFrame(onAnimate);
      
    }
    let id = requestAnimationFrame(onAnimate);
    return () => {
      cancelAnimationFrame(id);
    }
  }, [keyboard])

  return h(kayo.HorizontalFrame, {}, [
    h('div', { style: { display: 'flex', flex: 1, minWidth: '0%' } }, [
      h(threeCommon.SimpleCanvas, {overrides: { sceneRef, cameraRef, rootRef, canvasRef }, rootProps: { tabIndex: 0 } }, [
        h(actThree.perspectiveCamera, { ref: cameraRef }),
        h(actThree.mesh, { geometry: floorGeo, position: new threeCommon.three.Vector3(0, -5, 0), material: floorMaterial }),
        h(actThree.ambientLight, { color: new threeCommon.three.Color('white'), intensity: 1 }),
        selection.selectedItems.map(selected => {
          return h(SelectedObject, { selected });
        }),
      ]),
    ]),
    h(ModelWizardSidebar, { scene: gltf && gltf.scene, selection })
  ]);
}

const SelectedObject = ({ selected }: { selected: three.Object3D }) => {
  const ref = useRef<three.Group | null>(null);
  
  useEffect(() => {
    const helper = new three.BoxHelper(selected);
    if (ref.current) {
      ref.current.attach(helper);
      return () => {
        if (helper.parent) {
          helper.removeFromParent();
        }
      }
    }
  }, [selected]);

  return h(actThree.group, { ref });
};

const floorGeo = new threeCommon.three.BoxGeometry(2000, 1, 2000);
const floorMaterial = new threeCommon.three.MeshBasicMaterial({ color: 'blue' })

export type ModelWizardSidebarProps = {
  scene: null | three.Object3D,

  selection: ac.SelectionManger<three.Object3D>,
}

export const ModelWizardSidebar: act.Component<ModelWizardSidebarProps> = ({ scene, selection }) => {

  return h(CrystalBall, {}, [
    scene && [
      h(formula.ExternalEditor, { label: { name: 'Scene Tree', type: 'Scene' } },
        h(threeCommon.SceneTree, { root: scene, selection })
      ),
    ],
    selection.selectedItems.map(selected => {
      return [
        h(formula.TextEditor, {
          label: { name: 'Name', type: selected.type },
          disabled: true,
          value: selected.name,
        }),
        h(formula.Vector3Editor, {
          label: { name: 'Position' },
          value: selected.position,
          disabled: true,
        }),
      ]
    })
  ])
}