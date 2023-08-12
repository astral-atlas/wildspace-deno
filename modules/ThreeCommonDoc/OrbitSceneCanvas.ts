import { act, actThree, schedule, three, threeCommon } from "./deps.ts";
const { h } = act;

export type OrbitSceneCanvasProps = {
  speed?: number;
  distance?: number;
};

export const OrbitSceneCanvas: act.Component<OrbitSceneCanvasProps> = ({
  speed = .1,
  distance = 50,
  children,
}) => {
  const cameraRef = act.useRef<three.PerspectiveCamera | null>(null);

  schedule.useAnimation("OrbitSceneCanvas", ({ now }) => {
    const camera = cameraRef?.current;
    if (!camera) return;

    camera.position.set(
      Math.sin((now / 1000) * speed * Math.PI * 2) * distance,
      distance,
      Math.cos((now / 1000) * speed * Math.PI * 2) * distance
    );
    camera.lookAt(new three.Vector3(0, 0, 0));
  });

  return h(threeCommon.SimpleCanvas, {
    overrides: { cameraRef },
  }, [
    h(actThree.perspectiveCamera, { ref: cameraRef }),
    children,
  ]);
};
