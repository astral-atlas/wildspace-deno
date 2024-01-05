import { act } from "./deps.ts";

const { h } = act;

export type GridPatternProps = {
  id: string,
  size: number,
  ref: act.Ref<SVGPatternElement | null>,
}

export const GridPattern: act.Component<GridPatternProps> = ({ id, size, ref }) => {
  return h('pattern', {
    ref,
    id,
    width: `${size}px`,
    height: `${size}px`,
    patternUnits: 'userSpaceOnUse'
  }, [
    h('path', {
      d: `M ${size} 0 L 0 0 0 ${size}`,
      fill: 'none',
      stroke: 'gray',
      'stroke-width': '0.5'
    }),
  ]);
}