import { useDraggableSurface2 } from "../../../Deskplane/mod.ts";
import { GameController } from "../../../Journal/mod.ts";
import { keyboardStateControllerContext } from "../../../Keyboard/keyboardStateController.ts";
import { useKeyboardElementRef } from "../../../Keyboard/mod.ts";
import { actCommon } from "../../deps.ts";
import { universe } from "../../deps.ts";
import { act } from "../../deps.ts";
import { FileContent } from "../../models.ts";
import { FileItemT } from "../../models.ts";
import { threeCommon, actThree } from "../deps.ts";


// @deno-types="vite-css"
import styles from './AssetWizard.module.css';

const { h, useState, useEffect, useRef, useContext } = act;
const { useAsync } = actCommon;


export type AssetWizardProps = {
  onFileContentUpdate?: (content: FileContent) => unknown,
  file: FileItemT<"asset">,
  universe: universe.Backend,
  gameC: GameController
}

export const AssetWizard: act.Component<AssetWizardProps> = ({ file, universe, onFileContentUpdate, gameC }) => {

  const [stagingFile, setStagingFile] = useState<File | null>(null);
  const asset = useAsync(async () => {
    if (!file.content.assetId)
      return null;
  
    const asset = await universe.artifact.assets.service.read({
      gameId: gameC.gameId,
      assetId: file.content.assetId
    });
    return asset;
  }, [file.content.assetId])
  const assetBlob = useAsync(async () => {
    if (!file.content.assetId)
      return;
    return await gameC.artifact.downloadAsset(gameC.gameId, file.content.assetId);
  }, [file.content.assetId])

  const onCreateAssetClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    const onSubmitFile = (event: Event) => {
      if (!input.files)
        return;

      console.log(input.files[0], event);
      setStagingFile(input.files[0])
      input.removeEventListener('input', onSubmitFile);
    }
    input.addEventListener('input', onSubmitFile);
    input.click();
  };
  const onUploadStagingAsset = async () => {
    if (!stagingFile)
      return;
    const asset = await gameC.artifact.uploadAsset(gameC.gameId, stagingFile);
    onFileContentUpdate && onFileContentUpdate({ type: 'asset', assetId: asset.id });
  };
  const onClearAsset = () => {
    onFileContentUpdate && onFileContentUpdate({ type: 'asset', assetId: null });
  }

  const empty = [
    h('div', { className: styles.actionBar },
      h('button', { onClick: onCreateAssetClick }, 'Select Asset to Upload'),
    ),
  ];
  const staging = stagingFile && [
    h('div', { className: styles.actionBar }, [
      h('button', { onClick: onCreateAssetClick }, 'Select Asset to Upload'),
      h('button', { onClick: onUploadStagingAsset }, 'Upload Asset'),
    ]
    ),
    h('div', { className: styles.infoBar },
      h('pre', {}, JSON.stringify({
      name: stagingFile.name,
      size: stagingFile.size,
      type: stagingFile.type,
    }, null, 2))),
    h('div', { className: styles.preview }, [
      stagingFile.type.startsWith('image')
        && h(ImagePreview, { file: stagingFile }),

      (!!stagingFile.type.startsWith('model/gltf+json') ||
      !!stagingFile.type.startsWith('model/gltf-binary'))
        && h(GLTFPreview, { file: stagingFile }),
    ]),
  ]
  const existing = asset && [
    h('div', { className: styles.actionBar },
      h('button', { onClick: onClearAsset }, 'Clear Asset')
    ),
    h('div', { className: styles.infoBar },
      h('pre', {}, JSON.stringify({
        name: asset.id,
        type: asset.contentType,
        size: asset.contentLength,
    }, null, 2))),
    !!assetBlob && h('div', { className: styles.preview }, [
      !!asset.contentType.startsWith('image')
        && h(ImagePreview, { file: assetBlob }),
      (!!asset.contentType.startsWith('model/gltf+json') ||
      !!asset.contentType.startsWith('model/gltf-binary'))
        && h(GLTFPreview, { file: assetBlob }),
    ]),
  ];

  return [
    !asset && !stagingFile && empty,
    !asset && stagingFile && staging,
    asset && existing,
  ];
};

const ImagePreview = ({ file }: { file: Blob }) => {
  const [url, setURL] = useState<null | URL>(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setURL(new URL(url));
    return () => {
      URL.revokeObjectURL(url);
    }
  }, [file]);

  if (!url)
    return 'loading';

  return h('img', { src: url.href, style: { height: '300px', width: 'max-content' } })
}

const GLTFPreview = ({ file }: { file: Blob }) => {
  const sceneRef = useRef<threeCommon.three.Scene | null>(null);
  const cameraRef = useRef<threeCommon.three.PerspectiveCamera | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const gltf = useAsync(async () => {
    const loader = new threeCommon.gltf.GLTFLoader()

    return await loader.parseAsync(await file.arrayBuffer(), '')
  }, [file])

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

  return h('div', { style: { display: 'flex' }}, [
    h(threeCommon.SimpleCanvas, {overrides: { sceneRef, cameraRef, rootRef, canvasRef }, rootProps: { tabIndex: 0, className: styles.root } }, [
      h(actThree.perspectiveCamera, { ref: cameraRef }),
      h(actThree.mesh, { geometry: floorGeo, position: new threeCommon.three.Vector3(0, -5, 0), material: floorMaterial }),
      h(actThree.ambientLight, { color: new threeCommon.three.Color('white') }),
    ])
  ])
}

const floorGeo = new threeCommon.three.BoxGeometry(2000, 1, 2000);
const floorMaterial = new threeCommon.three.MeshBasicMaterial({ color: 'blue' })