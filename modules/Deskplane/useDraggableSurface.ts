import { Ref, useEffect, useRef, useState } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { useAnimation } from "../FrameScheduler/useAnimation.ts";
import { rxjs, three } from "./deps.ts";

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
  onDrag: (change: three.Vector2, element: Element) => unknown,
): DraggableSurface => {
  const events = useRef(new rxjs.Subject<DragEvent>()).current;
  const [dragging, setDragging] = useState<null | Element>(null);

  const change = useRef(new three.Vector2(0, 0)).current;
  useEffect(() => {
    const { current: draggable } = draggableElementRef;
    if (!draggable)
      return;

    let isDragging = false;

    const onPointerDown = (event: PointerEvent) => {
      //if (event.target !== draggable)
      //  return;
      
      isDragging = true;
      setDragging(draggable);
      draggable.setPointerCapture(event.pointerId);
    };
    const onPointerUp = (event: PointerEvent) => {
      isDragging = false;
      setDragging(null);
      draggable.releasePointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      events.next({
        state: isDragging ? 'dragging' : 'moving'
      })
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
    if (!dragging)
      return;
    onDrag(change, dragging);
    change.set(0, 0);
  }, [dragging])
  

  return { dragging, events };
};
