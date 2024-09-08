import { MutVec, Rect, rect as rectu } from "space";
import { act } from "../../deps";
import { EyeballEngine } from "./engine";
import { useAnimation } from "../../../FrameScheduler/useAnimation";

const styles = {
  svg: {
    flex: 1
  }
}

export type DebuggerProps = {
  engine: EyeballEngine,
};

export const Debugger: act.Component<DebuggerProps> = ({ engine }) => {
  return act.h('svg', { style: styles.svg }, [
    act.h(DebugRect, { engine, rect: engine.core.screenRect }),
    act.h(DebugMutPoint, { engine, vec: engine.core.mousePosition }),

    engine.dropdowns.dropdowns.map(d => [
      d.placement && act.h(DebugRect, { rect: d.placement, engine, color: 'blue' }),
      d.target && act.h(DebugRect, { rect: d.target, engine, color: 'red' }),
    ])
  ]);
}

type DebugRectProps = {
  engine: EyeballEngine,
  rect: Rect<2>,
  color?: string,
};
const DebugRect: act.Component<DebugRectProps> = ({ engine, rect, color = "black" }) => {
  return act.h('rect', {
    x: rect.position.x,
    y: rect.position.y,
    width: rect.size.x,
    height: rect.size.y,
    style: {
      stroke: color,
      fill: 'none',
    }
  })
}

type DebugMutPointProps = {
  engine: EyeballEngine,
  vec: MutVec<2>,
};
const DebugMutPoint: act.Component<DebugMutPointProps> = ({ vec, engine }) => {
  const ref = act.useRef<SVGCircleElement | null>(null);

  useAnimation('DebugMutPoint', () => {
    if (!ref.current)
      return;
    ref.current.setAttribute('cx', vec.x.toString());
    ref.current.setAttribute('cy', vec.y.toString());
  }, [engine])

  return act.h('circle', {
    ref,
    cx: vec.x,
    cy: vec.y,
    r: 2,
  })
}