import { Ref, useEffect, useRef, useState } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { Vector2 } from "https://esm.sh/three@0.155.0";
import { useSimulation } from "../FrameScheduler/useSimulation.ts";
import { useAnimation } from "../FrameScheduler/useAnimation.ts";

export type DraggableSurface = {
  dragging: Element | null
};

export const useDraggableSurface = (
  draggableElementRef: Ref<null | HTMLElement>,
  onDrag: (change: Vector2, element: Element) => unknown
): DraggableSurface => {
  const [dragging, setDragging] = useState<null | Element>(null);

  useEffect(() => {
    const { current: draggable } = draggableElementRef;
    if (!draggable)
      return;

    const onPointerDown = (event: PointerEvent) => {
      console.log('DOWN', event.target);
      if (event.target !== draggable)
        return;
      setDragging(draggable);
      draggable.setPointerCapture(event.pointerId);
    };
    const onPointerUp = (event: PointerEvent) => {
      console.log('UP', event.target);
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

  const change = useRef(new Vector2(0, 0)).current;
  useEffect(() => {
    const { current: draggable } = draggableElementRef;
    if (!draggable || !dragging)
      return;

    const onPointerMove = (event: PointerEvent) => {
      change.set(event.movementX, event.movementY)
    };

    draggable.addEventListener('pointermove', onPointerMove);
    return () => {
      draggable.removeEventListener('pointermove', onPointerMove);
    }
  }, [dragging, onDrag]);

  useAnimation('useDraggableSurface', () => {
    if (!dragging)
      return;
    onDrag(change, dragging);
    change.set(0, 0);
  }, [dragging])
  

  return { dragging };
};
