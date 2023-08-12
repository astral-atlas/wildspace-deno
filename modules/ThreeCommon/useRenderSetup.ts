import { act, css2d, schedule, three } from "./deps.ts"

export type RenderSetup = {
  canvasRef:  act.Ref<null | HTMLCanvasElement>,
  cameraRef:  act.Ref<null | three.PerspectiveCamera>,
  rootRef:    act.Ref<null | HTMLElement>,
  sceneRef:   act.Ref<null | three.Scene>,

  renderEmitter: schedule.FrameSchedulerEmitter<RenderFrame>
};

export type RenderSetupOverrides = {
  canvasRef?: act.Ref<null | HTMLCanvasElement>,
  cameraRef?: act.Ref<null | three.PerspectiveCamera>,
  sceneRef?:  act.Ref<null | three.Scene>,
  rootRef?:   act.Ref<null | HTMLElement>,

  onResize?: (
    width: number,
    height: number,
  ) => void,
};

const useOverridableRef = <T>(override: void | act.Ref<null | T>): act.Ref<null | T> => {
  const localRef = act.useRef<null | T>(null);
  return override || localRef;
}

export type RenderFrame = schedule.AnimationFrame & {
  camera: three.PerspectiveCamera,
  canvas: HTMLCanvasElement,
  scene: three.Scene,
};

export const useRenderSetup = (
  overrides: RenderSetupOverrides = {},
  deps: act.Deps = []
): RenderSetup => {
  const canvasRef = useOverridableRef(overrides.canvasRef);
  const cameraRef = useOverridableRef(overrides.cameraRef);
  const sceneRef = useOverridableRef(overrides.sceneRef);
  const rootRef = useOverridableRef(overrides.rootRef);

  const scheduler = schedule.useFrameScheduler();

  const renderEmitter = act.useRef(
    schedule.createFrameSchedulerEmitter<RenderFrame>()
  ).current;

  act.useEffect(() => {
    const { current: canvas } = canvasRef;
    const { current: camera } = cameraRef;
    const { current: scene } = sceneRef;
    const { current: root } = rootRef;

    if (!canvas || !camera || !scene)
      return;

    const options = {
      canvas,
    }
    const renderer = new three.WebGLRenderer(options);
    const css2dRenderer = root && new css2d.CSS2DRenderer({ element: root });
    renderer.outputColorSpace = three.SRGBColorSpace;
    
    const renderEvent: RenderFrame = {
      deltaMs: 0,
      now: 0,
      camera,
      canvas,
      scene,
    };
    const onRender = (frame: schedule.AnimationFrame) => {
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

  const setup = act.useMemo(() => ({
    canvasRef,
    cameraRef,
    sceneRef,
    rootRef,
    renderEmitter,
  }), []);

  return setup;
};

