import { useRenderSetup, RenderSetupOverrides } from "./mod.ts";

import { renderSetupContext } from "./RenderSetupContext.ts";
import {
  h, scene, Component, SceneProps
} from './deps.ts';

export type SimpleCanvasProps = {
  className?: string,
  canvasProps?: { [prop: string]: unknown },
  sceneProps?: SceneProps,
  overrides?: RenderSetupOverrides,
}

export const SimpleCanvas: Component<SimpleCanvasProps> = ({
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
      tabIndex: 0,
      className,
    }),
    h(scene, { ...sceneProps, ref: render.sceneRef },
      h(renderSetupContext.Provider, { value: render },
        children)),
  ];
};
