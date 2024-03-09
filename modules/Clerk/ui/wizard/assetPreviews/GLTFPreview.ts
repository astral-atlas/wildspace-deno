import { useDraggableSurface2 } from "../../../../Deskplane/mod.ts";
import { keyboardStateControllerContext, useKeyboardElementRef } from "../../../../Keyboard/mod.ts";
import { actCommon as ac, } from "../../../deps.ts";
import { act, threeCommon, actThree } from "../../deps.ts";
import { WizardAssetPreviewProps } from "./props.ts";
import { CrystalBall } from '../CrystalBall.ts';

const { h, useRef, useEffect, useContext } = act;
const { useAsync } = ac;

export const GLTFPreview: act.Component<WizardAssetPreviewProps> = ({ content }) => {
  const sceneRef = useRef<threeCommon.three.Scene | null>(null);
  const cameraRef = useRef<threeCommon.three.PerspectiveCamera | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

  return h('div', {  style: { display: 'flex', maxHeight: '100%', flexDirection: 'row' } }, [
    h('div', { style: { display: 'flex', flex: 1, minWidth: '0%' } }, [
      h(threeCommon.SimpleCanvas, {overrides: { sceneRef, cameraRef, rootRef, canvasRef }, rootProps: { tabIndex: 0 } }, [
        h(actThree.perspectiveCamera, { ref: cameraRef }),
        h(actThree.mesh, { geometry: floorGeo, position: new threeCommon.three.Vector3(0, -5, 0), material: floorMaterial }),
        h(actThree.ambientLight, { color: new threeCommon.three.Color('white') }),
      ]),
    ]),
    h(CrystalBall, {}, [
      gltf && h(threeCommon.SceneTree, { root: gltf.scene })
    ])
  ]);
}

const floorGeo = new threeCommon.three.BoxGeometry(2000, 1, 2000);
const floorMaterial = new threeCommon.three.MeshBasicMaterial({ color: 'blue' })