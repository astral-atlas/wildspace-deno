import { Ref, useEffect, useState } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { Vector2 } from "https://esm.sh/three@0.155.0";

export type DraggableSurface = {
  dragging: Element | null
};

export const useDraggableSurface = (
  draggableElementRef: Ref<null | HTMLElement>,
  onDrag: (change: Vector2, event: PointerEvent, element: Element) => unknown
): DraggableSurface => {
  const [dragging, setDragging] = useState<null | Element>(null);

  useEffect(() => {
    const { current: draggable } = draggableElementRef;
    if (!draggable)
      return;

    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Element))
        return;
      setDragging(event.target);
      draggable.setPointerCapture(event.pointerId);
    };
    const onPointerUp = (event: PointerEvent) => {
      setDragging(null);
      draggable.releasePointerCapture(event.pointerId);
    };
    draggable.addEventListener('pointerdown', onPointerDown);
    draggable.addEventListener('pointerup', onPointerUp);

    return () => {
      draggable.removeEventListener('pointerdown', onPointerDown);
      draggable.removeEventListener('pointerup', onPointerUp);
    }
  }, []);

  useEffect(() => {
    const { current: draggable } = draggableElementRef;
    if (!draggable || !dragging)
      return;

    const change = new Vector2(0, 0);
    const onPointerMove = (event: PointerEvent) => {
      change.set(event.movementX, event.movementY)
      onDrag(change, event, dragging);
    };

    draggable.addEventListener('pointermove', onPointerMove);
    return () => {
      draggable.removeEventListener('pointermove', onPointerMove);
    }
  }, [dragging, onDrag]);
  

  return { dragging };
};
