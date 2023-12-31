import { useRenderSetup, RenderSetupOverrides } from "./mod.ts";

import { renderSetupContext } from "./RenderSetupContext.ts";
import { act, actThree, three } from './deps.ts';
import { useEffect } from "https://esm.sh/@lukekaalim/act@2.6.0";
const { h } = act;

export type SimpleCanvasProps = {
  className?: string,
  canvasProps?: { [prop: string]: unknown },
  sceneProps?: actThree.SceneProps,
  overrides?: RenderSetupOverrides,

  onResize?: (canvasSize: three.Vector2) => unknown,
}

export const SimpleCanvas: act.Component<SimpleCanvasProps> = ({
  children,
  className = '',
  onResize,
  canvasProps = {},
  sceneProps = {},
  overrides = {}
}) => {
  const render = useRenderSetup(overrides)
  useEffect(() => {
    const subscription = render.rendererResize.subscribe(onResize);
    return () => subscription.unsubscribe();
  }, [render])

  return [
    h('div', { ref: render.rootRef, style: { position: 'absolute' } }),
    h('canvas', {
      ...canvasProps,
      ref: render.canvasRef,
      width: 600, height: 300,
      style: { flex: 1 },
      tabIndex: 0,
      className,
    }),
    h(actThree.scene, { ...sceneProps, ref: render.sceneRef },
      h(renderSetupContext.Provider, { value: render },
        children)),
  ];
};
