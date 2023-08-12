import { useRenderSetup, RenderSetupOverrides } from "./mod.ts";

import { renderSetupContext } from "./RenderSetupContext.ts";
import { act, actThree, three } from './deps.ts';
const { h } = act;

export type SimpleCanvasProps = {
  className?: string,
  canvasProps?: { [prop: string]: unknown },
  sceneProps?: actThree.SceneProps,
  overrides?: RenderSetupOverrides,
}

export const SimpleCanvas: act.Component<SimpleCanvasProps> = ({
  children,
  className = '',
  canvasProps = {},
  sceneProps = {},
  overrides = {}
}) => {
  const render = useRenderSetup(overrides)

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
