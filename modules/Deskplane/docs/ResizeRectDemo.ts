import { FramePresenter } from "../../ComponentDoc/mod.ts";
import { ResizeRectControls } from "../ResizeRect.ts";
import { act } from "../deps.ts";
import { GridSVG } from "../mod.ts";

const { h, useState } = act;

export const ResizeRectDemo = () => {
  const [rect, setRect] = useState({
    size: { x: 50, y: 50 },
    position: { x: 10, y: 10 },
  });

  return h(FramePresenter, {}, [
    h(GridSVG, {
      style: { position: "absolute", height: "100%", width: "100%" },
    }),
    h("div",
      {
        style: {
          backgroundColor: "rgb(160, 165, 247)",
          border: "1px solid black",
          position: "absolute",
          width: rect.size.x + "px",
          height: rect.size.y + "px",
          top: rect.position.y + "px",
          left: rect.position.x + "px",
        },
      },
      h(ResizeRectControls,
        {
          rect,
          onResize: setRect,
        },
        h("div",
          {
            style: {
              padding: "12px",
              height: "100%",
              width: "100%",
              overflow: "hidden",
              boxSizing: 'border-box',
            },
          },
          "IM THE CONTENTS OF A RECT"
        ),
      ),
    ),
  ]);
};
