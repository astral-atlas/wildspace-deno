import { useRef } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { rxjs } from "./deps.ts";
import { act, css2d, schedule, three } from "./deps.ts"
import { useOverridableRef } from "./useOverridableRef.ts";

export type RenderSetup = {
  canvasRef:    act.Ref<null | HTMLCanvasElement>,
  cameraRef:    act.Ref<null | three.PerspectiveCamera>,
  rootRef:      act.Ref<null | HTMLElement>,
  sceneRef:     act.Ref<null | three.Scene>,
  rendererRef:  act.Ref<null | three.WebGLRenderer>,

  rendererCreate: rxjs.Observable<null | three.WebGLRenderer>,
  rendererResize: rxjs.Observable<three.Vector2>,

  renderEmitter: schedule.FrameSchedulerEmitter<RenderFrame>
};

export type RenderSetupOverrides = {
  canvasRef?:   act.Ref<null | HTMLCanvasElement>,
  cameraRef?:   act.Ref<null | three.PerspectiveCamera>,
  sceneRef?:    act.Ref<null | three.Scene>,
  rootRef?:     act.Ref<null | HTMLElement>,
  rendererRef?: act.Ref<null | three.WebGLRenderer>,

  onResize?: (
    width: number,
    height: number,
  ) => void,
};

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
  const rendererRef = useOverridableRef(overrides.rendererRef);

  const rendererCreate = useRef(new rxjs.Subject<null | three.WebGLRenderer>()).current;
  const rendererResize = useRef(new rxjs.Subject<three.Vector2>()).current;

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
      alpha: true,
    }
    const renderer = new three.WebGLRenderer(options);
    const css2dRenderer = root && new css2d.CSS2DRenderer({ element: root });
    renderer.outputColorSpace = three.SRGBColorSpace;
    rendererRef.current = renderer;
    rendererCreate.next(renderer);
    
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
      rendererResize.next(renderer.getSize(new three.Vector2()));
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
    console.log('Renderer created')
    return () => {
      console.log("Renderer disposed")
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
    rendererRef,
    rendererCreate,
    rendererResize,
  }), []);

  return setup;
};

