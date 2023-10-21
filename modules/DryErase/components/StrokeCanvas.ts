import { act, actCommon, hash, skia } from "../deps.ts";
import { WhiteboardState } from "../state.ts";
import { WhiteboardLocalState, useWhiteboardSelector } from "./useWhiteboardState.ts";

const { h, useRef, useState, useEffect } = act;
const { useDisposable } = actCommon;

type StrokeRendererProps = {
  state: WhiteboardLocalState,
  style: { [string: string]: unknown },
};

const selectStrokes = (state: WhiteboardState) => {
  return state.strokes
}

export const StrokeCanvas: act.Component<StrokeRendererProps> = ({
  state,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [surface, setSurface] = useState<skia.canvaskit.Surface | null>(null);
  const canvaskit = skia.useCanvasKit();

  if (!canvaskit)
    return null;

  const strokes = useWhiteboardSelector(state, selectStrokes, []);

  // Generate the skia paths for each stroke
  const { strokeData } = useDisposable(() => {
    const strokeData = strokes.map(stroke => {
      const path = new canvaskit.Path()
      const paint = new canvaskit.Paint();

      const red = hash.fastHashCode(stroke.id) % 255
      const green = hash.fastHashCode(stroke.id + 1) % 255
      const blue = hash.fastHashCode(stroke.id + 2) % 255
      
      paint.setStyle(canvaskit.PaintStyle.Stroke);
      paint.setColor(canvaskit.Color(red, green, blue))
      paint.setStrokeWidth(2);

      const firstPoint = stroke.points[0];
      path.moveTo(firstPoint.position.x, firstPoint.position.y);
      for (const point of stroke.points) {
        path.lineTo(point.position.x, point.position.y);
      }

      return { path, paint };
    })

    const dispose = () => {
      for (const { path, paint } of strokeData) {
        path.delete();
        paint.delete();
      }
    };
    return { dispose, strokeData }
  }, [strokes, surface])

  // Use the generated paths to draw them onto the canvas
  useEffect(() => {
    const { current: htmlCanvas } = canvasRef;
    if (!surface || !htmlCanvas)
      return;
  

    const render = (canvas: skia.canvaskit.Canvas) => {
      const scaleX = (1/htmlCanvas.clientWidth) * surface.width();
      const scaleY = (1/htmlCanvas.clientHeight) * surface.height();
      
      canvas.clear(canvaskit.WHITE);
      canvas.save();

      canvas.scale(scaleX, scaleY);
      canvas.translate(state.camera.x, state.camera.y);

      for (const { path, paint } of strokeData)
        canvas.drawPath(path, paint);


      canvas.restore();

      frameId = surface.requestAnimationFrame(render)
    }
    let frameId = surface.requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frameId);
    }
  }, [strokeData, surface, state])

  // Create the SKIA Surface to render on
  useEffect(() => {
    const { current: canvas } = canvasRef;
    if (!canvas)
      return;
    canvas.height = canvas.clientHeight/2;
    canvas.width = canvas.clientWidth/2;
    const surface = canvaskit.MakeWebGLCanvasSurface(canvas);
    setSurface(surface);
  }, [])

  return h('canvas', { ref: canvasRef, style })
};