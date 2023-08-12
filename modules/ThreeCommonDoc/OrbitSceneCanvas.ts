import {
  PerspectiveCamera,
  SimpleCanvas,
  Vector3,
  useAnimation,
  perspectiveCamera,
  Component,
  h,
  useRef,
Color,
} from "./deps.ts";

export type OrbitSceneCanvasProps = {
  speed?: number;
  distance?: number;
};

export const OrbitSceneCanvas: Component<OrbitSceneCanvasProps> = ({
  speed = .1,
  distance = 50,
  children,
}) => {
  const cameraRef = useRef<PerspectiveCamera | null>(null);

  useAnimation("OrbitSceneCanvas", ({ now }) => {
    const camera = cameraRef?.current;
    if (!camera) return;

    camera.position.set(
      Math.sin((now / 1000) * speed * Math.PI * 2) * distance,
      distance,
      Math.cos((now / 1000) * speed * Math.PI * 2) * distance
    );
    camera.lookAt(new Vector3(0, 0, 0));
  });

  return h(SimpleCanvas, {
    overrides: { cameraRef },
    //sceneProps: { background: new Color('white') }
  }, [
    h(perspectiveCamera, { ref: cameraRef }),
    children,
  ]);
};
