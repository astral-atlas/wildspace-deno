import { WhiteboardChannel } from "./channel.ts";
import { DryEraseChannel } from "./channel/mod.ts";
import { useWhiteboardState } from "./components/useWhiteboardState.ts";
import { act, hash } from "./deps.ts";
import {
  WhiteboardCursor,
  WhiteboardStroke,
} from "./models.ts";
const { h, useState, useEffect, useRef } = act;

export type WhiteboardViewProps = {
  channel: DryEraseChannel;
};

export const WhiteboardView: act.Component<WhiteboardViewProps> = ({
  channel,
}) => {
  const ref = useRef<null | SVGSVGElement>(null);

  const { strokes, cursors } = useWhiteboardState(channel);

  useEffect(() => {
    const { current: svg } = ref;
    if (!svg) return;
    const onPointerMove = (e: PointerEvent) => {
      channel.send({
        type: "pointer-move",
        position: { x: e.offsetX, y: e.offsetY },
      });
    };
    const onPointerDown = (e: PointerEvent) => {
      console.log(e);
      channel.send({ 'type': 'stroke-start' })
    };
    const onPointerUp = (e: PointerEvent) => {
      console.log(e);
      channel.send({ 'type': 'stroke-end' })
    };
    svg.addEventListener("pointermove", onPointerMove);
    svg.addEventListener("pointerdown", onPointerDown);
    svg.addEventListener("pointerup", onPointerUp);
    return () => {
      svg.removeEventListener("pointermove", onPointerMove);
      svg.removeEventListener("pointerdown", onPointerDown);
      svg.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  return h("svg", { ref, style: { flex: 1 } }, [
    cursors.map(c => {
      return h('rect', {
        key: c.id,
        y: c.position.y,
        x: c.position.x,
        fill: `hsl(${hash.fastHashCode(c.ownerId, { forcePositive: true }) % 360}deg, 70%, 60%)`,
        width: "10", height: "10", rx: "2"
      })
    }),
    strokes.map(s => h('polyline', {
      stroke: `hsl(${hash.fastHashCode(s.id, { forcePositive: true }) % 360}deg, 70%, 60%)`,
      fill: 'none',
      points: s.points.map(p => [p.position.x, p.position.y].join(',')).join(' ') ,
    }))
  ]);
};
