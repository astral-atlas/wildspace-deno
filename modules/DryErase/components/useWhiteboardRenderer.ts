import { WhiteboardChannel } from "../channel.ts";
import { act, boxParticle, channel, rxjs, skia } from "../deps.ts";
import { Note, WhiteboardCursor, WhiteboardStroke } from "../models.ts";
import { StateMap, createStateMap, updateStateMap } from "../state.ts";
import { ObjectValue, Protocol } from "../protocol.ts";
const { useEffect, useRef } = act;

export type WhiteboardRenderer = {
  stateUpdates: rxjs.Observable<StateMap>,
  state: StateMap,
  render(): void,
};

export const useWhiteboardRenderer = (
  channel: WhiteboardChannel,
  stateRef: act.Ref<StateMap>,

  camera: boxParticle.Particle2D,
  transformRootRef: act.Ref<null | HTMLElement>,
  patternRef: act.Ref<null | SVGPatternElement>,

  canvasRef: act.Ref<HTMLCanvasElement | null>,
) => {
  const canvasKit = skia.useCanvasKit();

  const createRenderer = () => {
    const { current: canvas } = canvasRef;
    if (!canvasKit || !canvas)
      throw new Error();
    const skiaOptions = {
      antialias: 4
    };
    const surface = canvasKit.MakeWebGLCanvasSurface(
      canvas, canvasKit.ColorSpace.SRGB, skiaOptions
    );
    if (!surface)
      throw new Error();

    const scaleX = (1/canvas.clientWidth) * surface.width();
    const scaleY = (1/canvas.clientHeight) * surface.height();

    const paint = new canvasKit.Paint();
    paint.setStyle(canvasKit.PaintStyle.Stroke);
    paint.setColor(canvasKit.Color(0, 0, 0));
    paint.setStrokeWidth(2);

    const strokePaths = new Map<WhiteboardStroke["id"], skia.canvaskit.Path>();
    const cursorElements = new Map<WhiteboardCursor["id"], HTMLElement>();
    const noteElements = new Map<Note["id"], HTMLElement>();
    
    const drawCanvas = (skiaCanvas: skia.canvaskit.Canvas) => {
      skiaCanvas.save();
      skiaCanvas.clear(canvasKit.Color(255, 255, 255));
      skiaCanvas.translate(camera.position.x * scaleX, camera.position.y * scaleY);
      skiaCanvas.scale(scaleX, scaleY);

      for (const path of strokePaths.values()) {
        skiaCanvas.drawPath(path, paint);
      }

      skiaCanvas.restore();
    };
  
    const transformElements = () => {
      const transformCursor = (cursor: WhiteboardCursor, cursorElement: HTMLElement) => {
        const x = camera.position.x + cursor.position.x;
        const y = camera.position.y + cursor.position.y;
        cursorElement.style.transform = `translate(${x}px, ${y}px)`;
      }
      const transformNote = (note: Note, noteElement: HTMLElement) => {
        const x = camera.position.x + note.position.x;
        const y = camera.position.y + note.position.y;
        noteElement.style.transform = `translate(${x}px, ${y}px)`;
        noteElement.style.width = note.size.x + 'px';
        noteElement.style.height = note.size.y + 'px';
      }
      const transformPattern = (patternElement: SVGPatternElement) => {
        patternElement.setAttribute("x", camera.position.x.toString());
        patternElement.setAttribute("y", camera.position.y.toString());
      }
      for (const [cursorId, element] of cursorElements) {
        const cursor = state.get('cursors').get(cursorId, null);
        if (cursor)
          transformCursor(cursor, element);
      }
      for (const [noteId, element] of noteElements) {
        const note = state.get('notes').get(noteId, null);
        if (note)
          transformNote(note, element);
      }
      if (patternRef.current)
        transformPattern(patternRef.current)
    };

    const setStrokePath = (stroke: WhiteboardStroke) => {
      const path = strokePaths.get(stroke.id) || new canvasKit.Path();
      for (let i = 0; i < stroke.points.length; i++) {
        const point = stroke.points[i];
        if (i === 0)
          path.moveTo(point.position.x, point.position.y);
        else
          path.lineTo(point.position.x, point.position.y);
      }
      strokePaths.set(stroke.id, path);
    };
    const removeStrokePath = (strokeId: WhiteboardStroke["id"]) => {
      strokePaths.delete(strokeId);
    };

    const addObject = (object: ObjectValue) => {
      switch (object.type) {
        case 'note': {
          const { note } = object;
          const element = document.createElement('div');
          element.className = 'note';
          return noteElements.set(note.id, element);
        }
        case 'sticker': {
          const { sticker } = object;
          const element = document.createElement('div');
          element.className = 'sticker';
          return noteElements.set(sticker.id, element);
        }
        default:
          return;
      }
    }
    const updateObject = () => {

    }

    let state = createStateMap();
    const update = (message: Protocol["message2"]["server"]) => {
      state = updateStateMap(state, message);
      switch (message.type) {
        case 'add-object':
          return addObject(message.object);
        case 'update-object': {
          const { update, target } = message; 
          switch (update.type) {
            case 'move-object': {
              const object = 
            }
            case 'add-stroke-points': {
              const strokeId = target.type === 'stroke' && target.strokeId || null;
              const stroke = strokeId && state.strokes.get(strokeId, null)
              return stroke && setStrokePath(stroke)
            }
          }
          return;
        }
        case 'remove-object': {
          const { object } = message;
          const strokeId = object.type === 'stroke' && object.strokeId || null;
          return strokeId && removeStrokePath(strokeId);
        }
      }
    }

    const close = () => {
      for (const stroke of strokePaths.keys())
        removeStrokePath(stroke)
    };

    return {
      surface,
      drawCanvas,
      transformElements,

      update,

      setStrokePath,
      removeStrokePath,
      
      close,
    }
  }

  useEffect(() => {
    const renderer = createRenderer()
    const onFrame = (canvas: skia.canvaskit.Canvas) => {
      renderer.drawCanvas(canvas);
      id = renderer.surface.requestAnimationFrame(onFrame);
    }
    const channelSubscription = channel.recieve.subscribe(renderer.update);
    
    let id = renderer.surface.requestAnimationFrame(onFrame)
    return () => {
      cancelAnimationFrame(id);
      channelSubscription.unsubscribe();
    }
  }, []);
};
