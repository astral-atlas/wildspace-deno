import { FramePresenter } from "../ComponentDoc/FramePresenter.ts";
import { SimpleCanvasProps } from "../ThreeCommon/SimpleCanvas.ts";
import { act, actThree, schedule, three, threeCommon } from "./deps.ts";
const { h } = act;

export type OrbitSceneCanvasProps = {
  speed?: number;
  distance?: number;
  height?: number,
  overrides?: SimpleCanvasProps["overrides"],
  simpleCanvas?: SimpleCanvasProps,
}

export const OrbitSceneCanvas: act.Component<OrbitSceneCanvasProps> = ({
  speed = .05,
  distance = 50,
  height = 0,
  simpleCanvas = {},
  children,
  overrides = {},
}) => {
  const cameraRef = act.useRef<three.PerspectiveCamera | null>(null);

  schedule.useAnimation("OrbitSceneCanvas", ({ now }) => {
    const camera = cameraRef?.current;
    if (!camera) return;

    camera.position.set(
      Math.sin((now / 1000) * speed * Math.PI * 2) * distance,
      height || distance,
      Math.cos((now / 1000) * speed * Math.PI * 2) * distance
    );
    camera.lookAt(new three.Vector3(0, 0, 0));
  });

  return h(FramePresenter, {}, [
    h(threeCommon.SimpleCanvas, {
      ...simpleCanvas,
      overrides: { ...overrides, ...simpleCanvas.overrides, cameraRef },
    }, [
      h(actThree.perspectiveCamera, { ref: cameraRef }),
      children,
    ])
  ]);
};
