import { WhiteboardChannel } from "./channel.ts";
import { act, hash } from "./deps.ts";
import {
  WhiteboardCursor,
  WhiteboardStroke,
} from "./models.ts";
const { h, useState, useEffect, useRef } = act;

export type WhiteboardViewProps = {
  channel: WhiteboardChannel;
};

export const WhiteboardView: act.Component<WhiteboardViewProps> = ({
  channel,
}) => {
  const ref = useRef<null | SVGSVGElement>(null);
  const [strokes, setStrokes] = useState<WhiteboardStroke[]>([]);
  const [cursors, setCursors] = useState<WhiteboardCursor[]>([]);

  useEffect(() => {
    const subscription = channel.recieve.subscribe((event) => {
      switch (event.type) {
        case 'initialize':
          return setCursors(cs => [...cs, ...event.cursors])
        case "pointer-spawn":
          return setCursors((cs) => [...cs, event.cursor]);
        case "pointer-move":
          return setCursors((cs) =>
            cs.map((c) =>
              c.id === event.cursorId ? { ...c, position: event.position } : c
            )
          );
        case 'stroke-create':
          return setStrokes(ss => [...ss, event.stroke])
        case 'stroke-update':
          return setStrokes(ss => ss.map(s => s.id === event.stroke.id ? event.stroke : s))
        case "pointer-despawn":
          return setCursors((cs) =>
            cs.filter((c) => c.id !== event.cursorId)
          );
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
