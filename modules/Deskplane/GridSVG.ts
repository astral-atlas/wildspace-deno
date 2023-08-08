import { Component, Ref, h } from "https://esm.sh/@lukekaalim/act@2.6.0";

export type GridSVGInterval = {
  size: number,
  color: string,
  width: number,
}

export type GridSVGProps = {
  patternRef?: Ref<SVGPatternElement | null>,
  ref?: Ref<SVGSVGElement | null>,
  style?: { [style: string]: unknown },
  intervals?: GridSVGInterval[],
  patternSize?: number
};

export const defaultInverval: GridSVGInterval = {
  size: 64,
  width: 1,
  color: 'gray'
}

export const GridSVG: Component<GridSVGProps> = ({
  patternRef,
  ref,
  style,
  patternSize = 64,
  intervals = [defaultInverval]
}) => {
  return h("svg", { ref, style }, [
    h("defs", {}, [
      h( "pattern", {
          id: "grid",
          width: patternSize,
          height: patternSize,
          patternUnits: "userSpaceOnUse",
          ref: patternRef,
        },
        intervals.map(interval => h("path", {
          d: `M ${interval.size} 0 L 0 0 0 ${interval.size}`,
          stroke: `${interval.color}`,
          ["stroke-width"]: `${interval.width}`,
          ["fill"]: "none",
        })),
      ),
    ]),
    h("rect", { width: "100%", height: "100%", fill: "url(#grid)" }),
  ]);
};
