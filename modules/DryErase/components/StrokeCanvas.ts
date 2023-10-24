import { act, actCommon, hash, skia, three } from "../deps.ts";
import { WhiteboardStroke } from "../models.ts";
import { ServerProtocol } from "../protocol/mod.ts";
import { WhiteboardState } from "../state.ts";
import { WhiteboardLocalState, useWhiteboardSelector } from "./useWhiteboardState.ts";

const { h, useRef, useState, useEffect, useMemo } = act;
const { useDisposable } = actCommon;

type StrokeRendererProps = {
  state: WhiteboardLocalState,
  style: { [string: string]: unknown },
};

export const StrokeCanvas: act.Component<StrokeRendererProps> = ({
  state,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvaskit = skia.useCanvasKit();

  if (!canvaskit)
    return null;

  // Mutable map of all stroke data
  const strokeMap = useRef(
    new Map<
      WhiteboardStroke["id"],
      { paint: skia.canvaskit.Paint, path: skia.canvaskit.Path }
    >()
  ).current;

  // Create Skia-specific pieces of data.
  const createDataForStroke = useMemo(() => (stroke: WhiteboardStroke) => {
    const path = new canvaskit.Path()
    const paint = new canvaskit.Paint();

    // Random stroke color!
    const red = hash.fastHashCode(stroke.id) % 255
    const green = hash.fastHashCode(stroke.id + 1) % 255
    const blue = hash.fastHashCode(stroke.id + 2) % 255
    
    paint.setStyle(canvaskit.PaintStyle.Stroke);
    paint.setColor(canvaskit.Color(red, green, blue))
    paint.setStrokeWidth(2);

    const firstPoint = stroke.points[0];
    path.moveTo(firstPoint.x, firstPoint.y);
    for (const point of stroke.points) {
      path.lineTo(point.x, point.y);
    }

    return { path, paint };
  }, [canvaskit]);
  
  // Whenever an "init" (or the component is created for the first time),
  // or when the component it unmounted, make sure to clean up all resources.
  const clearOldStrokeData = () => {
    for (const { path, paint } of strokeMap.values()) {
      path.delete();
      paint.delete();
    }
    strokeMap.clear();
  }
  const initStrokeData = () => {
    for (const stroke of state.data.strokes.values())
      strokeMap.set(stroke.id, createDataForStroke(stroke))
  }
  // Update the stroke data whenever a stroke is created, deleted, or drawn
  const updateStroke = (message: ServerProtocol) => {
    switch (message.type) {
      case 'init': {
        clearOldStrokeData();
        initStrokeData();
        return;
      }
      case 'update-object': {
        if (message.subject.type !== 'stroke')
          return;
        const { strokeId } = message.subject;
        if (message.update.type === 'draw') {
          const prevData = strokeMap.get(strokeId)
          if (prevData) {
            prevData.path.delete();
            prevData.paint.delete();
            strokeMap.delete(strokeId)
          }
          const stroke = state.data.strokes.get(strokeId);
          if (!stroke)
            return;
          strokeMap.set(strokeId, createDataForStroke(stroke))
        }
        return;
      }
      case 'create-object': {
        if (message.object.type !== 'stroke')
          return;
        const { stroke } = message.object;
        strokeMap.set(stroke.id, createDataForStroke(stroke))
        return;
      }
    }
  }

  useEffect(() => {
    initStrokeData();
    const sub = state.updates.
      subscribe(({ message }) => updateStroke(message))
    return () => {
      sub.unsubscribe();
      clearOldStrokeData()
    }
  }, [state, createDataForStroke])

  const [canvasSize, setCanvasSize] = useState<null | DOMRect>(null)
  useEffect(() => {
    const { current: canvas } = canvasRef;
    if (!canvas)
      return;
    const resize = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect();
      setCanvasSize(c => {
        if (!c)
          return rect;
        if (c.width !== rect.width || c.height !== rect.height)
          return rect;
        return c;
      })
    });
    setCanvasSize(canvas.getBoundingClientRect())
    resize.observe(canvas);
    return () => {
      resize.disconnect();
    }
  }, [])

  // Create the SKIA Surface to render on
  useEffect(() => {
    const { current: htmlCanvas } = canvasRef;
    if (!htmlCanvas || !canvasSize)
      return;
    htmlCanvas.width = canvasSize.width/2;
    htmlCanvas.height = canvasSize.height/2;
    console.log('REGENERATING CANVAS');
    const surface = canvaskit.MakeWebGLCanvasSurface(htmlCanvas, undefined, { antialias: 2 });
    if (!surface)
      return;
    
    const render = (canvas: skia.canvaskit.Canvas) => {
      const scaleX = (1/htmlCanvas.clientWidth) * surface.width();
      const scaleY = (1/htmlCanvas.clientHeight) * surface.height();
      
      canvas.clear(canvaskit.TRANSPARENT);
      canvas.save();

      canvas.scale(scaleX, scaleY);
      canvas.translate(state.camera.x, state.camera.y);

      for (const { path, paint } of strokeMap.values())
        canvas.drawPath(path, paint);

      canvas.restore();

      frameId = surface.requestAnimationFrame(render)
    }
    let frameId = surface.requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frameId);
      surface.delete();
    }
  }, [canvasSize])

  return h('canvas', { ref: canvasRef, style: { ...style, pointerEvents: 'none' } })
};