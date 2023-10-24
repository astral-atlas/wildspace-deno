import { Ref, useEffect, useRef, useState } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { useAnimation } from "../FrameScheduler/useAnimation.ts";
import { actCommon, rxjs, three } from "./deps.ts";

export type DraggableSurface = {
  dragging: Element | null,
  events: rxjs.Observable<DragEvent>,
};

export type DragEvent = {
  start:    three.Vector2,
  current:  three.Vector2,
  delta:    three.Vector2,
  state:    'start-drag' | 'dragging' | 'end-drag' | 'moving',

  event: PointerEvent | MouseEvent | TouchEvent,
};

export const useDraggableSurface = (
  draggableElementRef: Ref<null | HTMLElement>,
  onDrag: (change: three.Vector2, element: Element, event: DragEvent) => unknown,
): DraggableSurface => {
  const events = useRef(new rxjs.Subject<DragEvent>()).current;
  const currentEvent = useRef<null | DragEvent>(null);
  const [dragging, setDragging] = useState<null | Element>(null);

  const change = useRef(new three.Vector2(0, 0)).current;

  const onDragRef = actCommon.useUpdatingMutableValue(onDrag)

  useEffect(() => {
    const { current: draggable } = draggableElementRef;
    if (!draggable)
      return;

    let isDragging = false;

    const start = new three.Vector2(0, 0)
    const current = new three.Vector2(0, 0);
    const delta = new three.Vector2(0, 0)

    const onPointerDown = (event: PointerEvent) => {
      if (event.target !== draggable)
        return;
      isDragging = true;
      setDragging(draggable);
      start.set(event.screenX, event.screenY)
      current.set(event.screenX, event.screenY);
      delta.set(0, 0);
      draggable.setPointerCapture(event.pointerId);

      const dragEvent = {
        state: 'start-drag',
        start,
        current,
        delta,
        event
      } as const;
      currentEvent.current = dragEvent;
      events.next(dragEvent)
    };
    const onPointerUp = (event: PointerEvent) => {
      isDragging = false;
      setDragging(null);
      draggable.releasePointerCapture(event.pointerId);

      const dragEvent = {
        state: 'end-drag',
        start,
        current,
        delta,
        event
      } as const;
      currentEvent.current = dragEvent;
      events.next(dragEvent)
    };

    const onPointerMove = (event: PointerEvent) => {
      current.set(event.screenX, event.screenY)
      delta.set(current.x - start.x, current.y - start.y);
      const dragEvent = {
        state: isDragging ? 'dragging' : 'moving',
        start,
        current,
        delta,
        event
      } as const;
      currentEvent.current = dragEvent;
      events.next(dragEvent)

      if (!isDragging)
        return;
      change.set(event.movementX, event.movementY)
    };

    draggable.addEventListener('pointerdown', onPointerDown);
    draggable.addEventListener('pointerup', onPointerUp);
    draggable.addEventListener('pointermove', onPointerMove);

    return () => {
      draggable.removeEventListener('pointerdown', onPointerDown);
      draggable.removeEventListener('pointerup', onPointerUp);
      draggable.removeEventListener('pointermove', onPointerMove);
    }
  }, []);


  useAnimation('useDraggableSurface', () => {
    if (!dragging || !currentEvent.current)
      return;
    onDragRef.current(change, dragging, currentEvent.current);
    change.set(0, 0);
  }, [dragging])
  

  return { dragging, events };
};
