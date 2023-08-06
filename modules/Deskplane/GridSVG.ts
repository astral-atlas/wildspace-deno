import { Component, Ref, h } from "https://esm.sh/@lukekaalim/act@2.6.0";

export type GridSVGProps = {
  patternRef?: Ref<SVGPatternElement | null>
};

export const GridSVG: Component<GridSVGProps> = ({ patternRef }) => {
  return h("svg", { height: "513px", width: "513px" }, [
    h("defs", {}, [
      h( "pattern", {
          id: "grid",
          width: "64",
          height: "64",
          patternUnits: "userSpaceOnUse",
          ref: patternRef,
        },
        h("path", {
          d: "M 64 0 L 0 0 0 64",
          stroke: "gray",
          ["stroke-width"]: "1",
          ["fill"]: "none",
        }),
      ),
    ]),
    h("rect", { width: "100%", height: "100%", fill: "url(#grid)" }),
  ]);
};
