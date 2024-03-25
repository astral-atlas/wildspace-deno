import { act, desk, three } from "./deps"

const { useEffect, useRef } = act;

/**
 * Using a HTMl Element, click and drag across it to rotate it
 * The rotation is limited to 2 degrees (x, z)
 * 
 * @param element 
 * @param rotation 
 */
export const useUprightDragRotate = (element: act.Ref<null | HTMLElement>, rotation: three.Euler) => {
  const rotationState = useRef(new three.Vector2(0, 0)).current;
  const surf = desk.useDraggableSurface2(element);

  useEffect(() => {
    const s = surf.onDragStart.subscribe((movement) => {
      movement.changes.subscribe(move => {
        rotationState.add(move.change)

        rotation.set(rotationState.y / 100, -rotationState.x / 100, 0, 'YXZ');
      })
    });

    return () => s.unsubscribe();
  }, [surf])
}