import {
  useEffect,
  useRef,
  useState,
} from "https://esm.sh/@lukekaalim/act@2.6.0";
import { act, skia, kayo, desk, boxParticle } from "../deps.ts";
const { h } = act;

export type WhiteboardEditorProps = {};

const style = {
  tabIndex: 0,
  display: "flex",
  flex: 1,
};
const toolbarStyle = {
  backgroundColor: "white",
  borderRadius: "8px",
  padding: "8px",
  margin: "auto auto 24px auto",
  gap: "8px",
  border: '1px solid black',
};

const modes = ["panning", "drawing", "noting", "sticking"] as const;
const cursorForMode = {
  panning: 'grab',
  drawing: 'auto',
  noting: 'text',
  sticking: 'crosshair',
} as const;

const deskplaneParticleSettings: boxParticle.ParticleSettings = {
  dragCoefficent: 0.005,
  velocityMagnitudeMax: 0.5,
  //bounds: new Box2(new Vector2(-512, -512), new Vector2(512, 512)),
};

export const WhiteboardEditor: act.Component<WhiteboardEditorProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasKit = skia.useCanvasKit();

  const [activeMode, setActiveMode] =
    useState<(typeof modes)[number]>("panning");

  useEffect(() => {
    if (!canvasKit) return;
    const { current: canvas } = canvasRef;
    if (!canvas) return;
    const surface = canvasKit.MakeWebGLCanvasSurface(canvas);
    if (!surface) return;

    surface.drawOnce((canvas) => {
      canvas.clear(canvasKit.BLUE);
    });
    return () => {
      surface.delete();
    };
  }, [canvasKit]);
  const elementRef = useRef(null);
  const patternRef = useRef<SVGPatternElement | null>(null);
  const childrenRef = useRef<HTMLElement | null>(null);

  const { dragging, particle } = desk.useDraggableParticle(elementRef, deskplaneParticleSettings, (particle) => {
    if (childrenRef.current) {
      childrenRef.current.style.transform = `translate(${particle.position.x}px, ${particle.position.y}px)`;
    }
    patternRef.current?.setAttribute("x", particle.position.x.toString());
    patternRef.current?.setAttribute("y", particle.position.y.toString());
  }, activeMode === 'panning')

  const cursor = cursorForMode[activeMode];

  return h("div", { style }, [
    h(desk.GridSVG, {
      patternRef,
      ref: elementRef,
      style: { cursor, position: 'relative', flex: 1 }
    }),
    /*
    h("canvas", { style: {
      position: "relative",
    }, ref: canvasRef }),
    */

    h(kayo.Toolbar,
      { direction: "down", style: toolbarStyle },
      modes.map((mode) => {
        return h("button",
          { onClick: () => setActiveMode(mode), disabled: mode === activeMode },
          mode
        );
      })
    ),
  ]);
};
