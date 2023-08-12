import { Deps, Ref, useEffect, useMemo, useRef } from "./deps.ts";

import {
  FrameSchedulerEmitter,
  createFrameSchedulerEmitter,
  AnimationFrame,
  useFrameScheduler,

  PerspectiveCamera, Scene,
  SRGBColorSpace, WebGLRenderer,
  CSS2DRenderer,
} from "./deps.ts";

export type RenderSetup = {
  canvasRef:  Ref<null | HTMLCanvasElement>,
  cameraRef:  Ref<null | PerspectiveCamera>,
  rootRef:    Ref<null | HTMLElement>,
  sceneRef:   Ref<null | Scene>,

  renderEmitter: FrameSchedulerEmitter<RenderFrame>
};

export type RenderSetupOverrides = {
  canvasRef?: Ref<null | HTMLCanvasElement>,
  cameraRef?: Ref<null | PerspectiveCamera>,
  sceneRef?:  Ref<null | Scene>,
  rootRef?:   Ref<null | HTMLElement>,

  onResize?: (
    width: number,
    height: number,
  ) => void,
};

const useOverridableRef = <T>(override: void | Ref<null | T>): Ref<null | T> => {
  const localRef = useRef<null | T>(null);
  return override || localRef;
}

export type RenderFrame = AnimationFrame & {
  camera: PerspectiveCamera,
  canvas: HTMLCanvasElement,
  scene: Scene,
};

export const useRenderSetup = (
  overrides: RenderSetupOverrides = {},
  deps: Deps = []
): RenderSetup => {
  const canvasRef = useOverridableRef(overrides.canvasRef);
  const cameraRef = useOverridableRef(overrides.cameraRef);
  const sceneRef = useOverridableRef(overrides.sceneRef);
  const rootRef = useOverridableRef(overrides.rootRef);

  const scheduler = useFrameScheduler();

  const renderEmitter = useRef(
    createFrameSchedulerEmitter<RenderFrame>()
  ).current;

  useEffect(() => {
    const { current: canvas } = canvasRef;
    const { current: camera } = cameraRef;
    const { current: scene } = sceneRef;
    const { current: root } = rootRef;

    if (!canvas || !camera || !scene)
      return;

    const options = {
      canvas,
      alpha: true,
    }
    const renderer = new WebGLRenderer(options);
    const css2dRenderer = root && new CSS2DRenderer({ element: root });
    renderer.outputColorSpace = SRGBColorSpace;
    
    const renderEvent: RenderFrame = {
      deltaMs: 0,
      now: 0,
      camera,
      canvas,
      scene,
    };
    const onRender = (frame: AnimationFrame) => {
      renderEvent.deltaMs = frame.deltaMs;
      renderEvent.now = frame.now;
      renderEmitter.invoke(renderEvent);
      renderer.render(scene, camera);
    }

    const onCanvasResize = () => {
      const canvasRect = canvas.getBoundingClientRect();
      renderer.setSize(canvasRect.width, canvasRect.height, false);
      if (css2dRenderer) {
        css2dRenderer.setSize(canvasRect.width, canvasRect.height)
      }

      camera.aspect = canvasRect.width / canvasRect.height;
      camera.updateProjectionMatrix();

      renderer.render(scene, camera);
    }
    const resizeObserver = new ResizeObserver(onCanvasResize);
    resizeObserver.observe(canvas);

    const renderSubscription = scheduler.animation.subscribe('3DRender', onRender);

    return () => {
      renderer.dispose();
      resizeObserver.disconnect();
      
      renderSubscription.unsubscribe();
    }
  }, deps)

  const setup = useMemo(() => ({
    canvasRef,
    cameraRef,
    sceneRef,
    rootRef,
    renderEmitter,
  }), []);

  return setup;
};

