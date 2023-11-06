import { FramePresenter } from "../../ComponentDoc/mod.ts";
import { act, three } from "../deps.ts";
import { createPointerObservables } from "../events.ts";
import { GridSVG } from "../mod.ts";
import { useDraggableSurface2 } from "../useDraggableSurface2.ts";

const { h, useRef, useEffect, useState } = act;

const style = {
  position: "relative",
  userSelect: "none",
  flex: 1,
};

export const DraggableSurface2Demo = () => {
  const elementRef = useRef<Element | null>(null);

  const [start, setStart] = useState<null | three.Vector2>(null);
  const [end, setEnd] = useState<null | three.Vector2>(null);

  const draggable = useDraggableSurface2(elementRef);
  useEffect(() => {
    const sub = draggable.onDragStart.subscribe((drag) => {
      setStart(drag.start.clone());
      setEnd(drag.start.clone());
      drag.changes.subscribe((event) => {
        switch (event.type) {
          case "move":
            return setEnd(drag.current.clone());
        }
      });
    });
    return () => {
      sub.unsubscribe();
    };
  }, [draggable]);

  return [
    h(FramePresenter, {}, [
      h(GridSVG, {
        style: { position: "absolute", height: "100%", width: "100%" },
      }),
      h("svg", { style, ref: elementRef }, [
        start &&
          end && [
            h("line", {
              x1: start.x,
              y1: start.y,

              x2: end.x,
              y2: end.y,
              stroke: "black",
              "stroke-width": "4px",
            }),
            h("line", {
              x1: start.x,
              y1: start.y,

              x2: start.x,
              y2: end.y,
              stroke: "red",
              "stroke-dasharray": "4",
              "stroke-width": "2px",
            }),
            h("line", {
              x1: start.x,
              y1: end.y,

              x2: end.x,
              y2: end.y,
              stroke: "green",
              "stroke-dasharray": "4",
              "stroke-width": "2px",
            }),
            h("text",
              {
                x: (start.x + end.x) / 2,
                y: end.y,
              },
              Math.abs(end.x - start.x) + "px"
            ),
            h("text",
              {
                x: start.x,
                y: (start.y + end.y) / 2,
              },
              Math.abs(end.y - start.y) + "px"
            ),
            h("text",
              {
                x: (start.x + end.x) / 2,
                y: (start.y + end.y) / 2,
              },
              Math.round(
                Math.pow(
                  Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2),
                  1 / 2
                )
              ) + "px"
            ),
            h('circle', {
              cx: start.x,
              cy: start.y,
              r: '5px',
            }),
            h('circle', {
              cx: end.x,
              cy: end.y,
              r: '5px',
            })
          ],
      ]),
    ]),
  ];
};
