import {
  useEffect,
  useRef,
  useState,
} from "https://esm.sh/@lukekaalim/act@2.6.0";
import { act, skia, kayo, desk, boxParticle } from "../deps.ts";
import { WhiteboardChannel } from "../channel.ts";
import { useWhiteboardState } from "./useWhiteboardState.ts";
import { schedule } from "../../ThreeCommon/deps.ts";
const { h } = act;

export type WhiteboardEditorProps = {
  channel: WhiteboardChannel;
};

const style = {
  display: "flex",
  flex: 1,
};
const toolbarStyle = {
  backgroundColor: "white",
  borderRadius: "8px",
  padding: "8px",
  margin: "auto auto 24px auto",
  gap: "8px",
  border: "1px solid black",
};

const modes = ["panning", "drawing", "noting", "sticking"] as const;
const cursorForMode = {
  panning: "grab",
  drawing: "auto",
  noting: "text",
  sticking: "crosshair",
} as const;

const deskplaneParticleSettings: boxParticle.ParticleSettings = {
  dragCoefficent: 0.005,
  velocityMagnitudeMax: 0.5,
  //bounds: new Box2(new Vector2(-512, -512), new Vector2(512, 512)),
};

export const WhiteboardEditor: act.Component<WhiteboardEditorProps> = ({
  channel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasKit = skia.useCanvasKit();

  const [activeMode, setActiveMode] =
    useState<(typeof modes)[number]>("panning");

  const elementRef = useRef<SVGSVGElement | null>(null);
  const patternRef = useRef<SVGPatternElement | null>(null);
  const childrenRef = useRef<HTMLElement | null>(null);

  const { cursors, strokes } = useWhiteboardState(channel);

  const cursorRefMap = useRef(new Map<string, HTMLElement>()).current;

  const {
    dragging: panning,
    particle: cameraParticle,
    events: dragEvents,
  } = desk.useDraggableParticle(
    elementRef as act.Ref<null | HTMLElement>,
    deskplaneParticleSettings,
    (particle) => {
      if (childrenRef.current) {
        childrenRef.current.style.transform = `translate(${particle.position.x}px, ${particle.position.y}px)`;
      }

      patternRef.current?.setAttribute("x", particle.position.x.toString());
      patternRef.current?.setAttribute("y", particle.position.y.toString());
    },
    activeMode === "panning"
  );
  const updateCursorPositions = () => {
    for (const [cursorId, cursorElement] of cursorRefMap) {
      const cursor = cursors.find((c) => c.id === cursorId);
      if (!cursor) continue;
      const x = cameraParticle.position.x + cursor.position.x;
      const y = cameraParticle.position.y + cursor.position.y;
      cursorElement.style.transform = `translate(${x}px, ${y}px)`;
    }
  };

  useEffect(() => {
    return dragEvents.subscribe((event) => {
      // if start drag, enable cursor events
      // if end drag, remove cursor events
      // for dragging or moving, move the camera
    }).unsubscribe;
  }, [dragEvents]);

  schedule.useAnimation(
    "WhiteboardEditor",
    () => {
      updateCursorPositions();
    },
    [cursors]
  );

  useEffect(() => {
    const { current: element } = elementRef;
    if (!element) return;
    const onPointerMove = (event: PointerEvent) => {
      const x = event.offsetX - cameraParticle.position.x;
      const y = event.offsetY - cameraParticle.position.y;
      channel.send({
        type: "pointer-move",
        position: { x, y },
      });
    };
    const onPointerDown = () => {
      if (activeMode !== "drawing") return;
      channel.send({
        type: "stroke-start",
      });
    };
    const onPointerUp = () => {
      if (activeMode !== "drawing") return;
      channel.send({
        type: "stroke-end",
      });
    };
    element.addEventListener("pointermove", onPointerMove);
    element.addEventListener("pointerdown", onPointerDown);
    element.addEventListener("pointerup", onPointerUp);
    return () => {
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerdown", onPointerDown);
      element.removeEventListener("pointerup", onPointerUp);
    };
  }, [activeMode]);

  const cursor = cursorForMode[activeMode];

  const strokesRef = useRef(strokes);
  useEffect(() => {
    strokesRef.current = strokes;
  }, [strokes]);

  useEffect(() => {
    if (!canvasKit) return;
    const { current: canvas } = canvasRef;
    if (!canvas) return;
    canvas.height = canvas.clientHeight;
    canvas.width = canvas.clientWidth;
    const surface = canvasKit.MakeWebGLCanvasSurface(canvas, canvasKit.ColorSpace.SRGB, {
      antialias: 4
    });
    if (!surface) return;

    const paint = new canvasKit.Paint();
    paint.setStyle(canvasKit.PaintStyle.Stroke);
    paint.setColor(canvasKit.Color(0, 0, 0));
    paint.setStrokeWidth(2);

    const draw = (skiaCanvas: skia.canvaskit.Canvas) => {
      const now = performance.now();
      const scaleX = (1/canvas.clientWidth) * surface.width();
      const scaleY = (1/canvas.clientHeight) * surface.height();
      skiaCanvas.save();
      skiaCanvas.clear(canvasKit.Color(255, 255, 255));
      skiaCanvas.translate(cameraParticle.position.x * scaleX, cameraParticle.position.y * scaleY);
      skiaCanvas.scale(scaleX, scaleY);
      //skiaCanvas.scale(1/surface.width(), 1/surface.height());
      //skiaCanvas.scale(1/2, 1/2);

      const strokePaths = strokesRef.current
        .map((stroke) => {
          const path = new canvasKit.Path();
          path.setFillType(canvasKit.FillType.EvenOdd)
          const start = stroke.points[0];
          if (!start) return null;
          path.moveTo(start.position.x, start.position.y);
          for (const point of stroke.points.slice(1)) {
            path.lineTo(point.position.x, point.position.y);
          }
          
          return path;
        })
        .filter((x): x is skia.canvaskit.Path => !!x);

      for (const path of strokePaths) {
        skiaCanvas.drawPath(path, paint);
        path.delete();
      }
      skiaCanvas.restore();
      id = surface.requestAnimationFrame(draw);
    };

    let id = surface.requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(id);
      surface.delete();
    };
  }, [canvasKit, activeMode]);

  return h("div", { style }, [
    h("canvas", {
      style: {
        position: "absolute",
        height: "100%",
        width: "100%",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
      ref: canvasRef,
    }),
    h(desk.GridSVG, {
      patternRef,
      ref: elementRef,
      svgProps: { tabindex: 0 },
      style: { cursor, position: "relative", flex: 1 },
    }),
    cursors.map((cursor) => {
      return h("div", {
        key: cursor.id,
        ref: (item: HTMLElement) => cursorRefMap.set(cursor.id, item),
        style: {
          pointerEvents: "none",
          height: `16px`,
          width: `16px`,
          backgroundColor: "red",
          position: "absolute",
          top: 0,
          left: 0,
        },
      });
    }),
    h(
      kayo.Toolbar,
      { direction: "down", style: toolbarStyle },
      modes.map((mode) => {
        return h(
          "button",
          { onClick: () => setActiveMode(mode), disabled: mode === activeMode },
          mode
        );
      })
    ),
  ]);
};
