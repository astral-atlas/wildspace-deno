import {
  useEffect,
  useRef,
  useState,
} from "https://esm.sh/@lukekaalim/act@2.6.0";
import { act, skia, kayo, desk, boxParticle } from "../deps.ts";
import { WhiteboardChannel } from "../channel.ts";
import { useWhiteboardLocalState, useWhiteboardSelector, useWhiteboardState } from "./useWhiteboardState.ts";
import { schedule } from "../../ThreeCommon/deps.ts";
import { WhiteboardVector } from "../models.ts";
import { CursorIndicator } from "./Cursor.ts";
import { StrokeCanvas } from "./StrokeCanvas.ts";
import { Controls } from "./Controls.ts";
import { NoteEditor } from "./NoteEditor.ts";
const { h, useMemo } = act;

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

  const { cursors, strokes, notes } = useWhiteboardState(channel);

  const cursorRefMap = useRef(new Map<string, HTMLElement>()).current;
  const noteRefMap = useRef(new Map<string, HTMLElement>()).current;

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
    for (const [noteId, noteElement] of noteRefMap) {
      const note = notes.find((c) => c.id === noteId);
      if (!note) continue;
      const x = cameraParticle.position.x + note.position.x;
      const y = cameraParticle.position.y + note.position.y;
      noteElement.style.transform = `translate(${x}px, ${y}px)`;
      console.log(noteElement.style.transform)
      noteElement.style.width = note.size.x + 'px';
      noteElement.style.height = note.size.y + 'px';
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

  const state = useWhiteboardLocalState(channel);

  if (!state)
    return null;

  const cursorCount = useWhiteboardSelector(state, useMemo(() => (state) => {
    return state.cursors.length;
  }, []), 0)
  const noteCount = useWhiteboardSelector(state, useMemo(() => (state) => {
    return state.notes.length;
  }, []), 0)

  schedule.useAnimation('WhiteboardEditor', () => {
    patternRef.current?.setAttribute("x", state.camera.x.toString());
    patternRef.current?.setAttribute("y", state.camera.y.toString());
  })

  return h("div", { style }, [
    h(StrokeCanvas, {
      state,
      style: {
        position: "absolute",
        height: "100%",
        width: "100%",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
    }),
    h(desk.GridSVG, {
      patternRef,
      ref: elementRef,
      svgProps: { tabindex: 0 },
      style: { cursor, position: "relative", flex: 1 },
    }),
    Array.from({ length: cursorCount })
      .map((_, cursorIndex) => h(CursorIndicator, { cursorIndex, state })),

    h(Controls, { state, editorState: { mode: activeMode } }),
    Array.from({ length: noteCount })
      .map((_, noteIndex) => h(NoteEditor, { noteIndex, state })),
    h(kayo.Toolbar,
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
