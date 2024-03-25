import { rxjs, three, act } from "./deps.ts";
import { createPointerObservables, createTouchObservables } from "./events.ts";

const { useEffect, useRef } = act;

export type DragSurface2 = {
  startDrag: (start: three.Vector2) => DragMovement;
  onDragStart: rxjs.Observable<DragMovement>;
};

export type DragMovement = {
  start: three.Vector2;
  current: three.Vector2;
  delta: three.Vector2;

  changes: rxjs.Observable<DragMovementEvent>;
  finish: rxjs.Observable<null>;

  move: (change: three.Vector2) => void;
  set: (position: three.Vector2) => void;
  end: () => void;
};

const createDragSurface = (): DragSurface2 => {
  const onDragStart = new rxjs.Subject<DragMovement>();
  const startDrag = (start: three.Vector2) => {
    const changes = new rxjs.Subject<DragMovementEvent>();
    const finish = new rxjs.Subject<null>();
    const current = start.clone();
    const delta = new three.Vector2();

    const move = (change: three.Vector2) => {
      current.add(change);
      delta.add(change);
      changes.next({ change });
    };
    const set = (newCurrent: three.Vector2) => {
      const change = newCurrent.clone().sub(current);
      move(change);
    };
    const end = () => {
      changes.complete();
      finish.next(null);
    };
    const movement = {
      move,
      end,
      set,
      start,
      finish,
      delta,
      changes,
      current,
    };
    onDragStart.next(movement);
    return movement;
  };
  return { startDrag, onDragStart };
};

type DragMovementEvent =
  | { change: three.Vector2 };

export const useDraggableSurface2 = (
  elementRef: act.Ref<Element | null>,
  deps: act.Deps = []
): DragSurface2 => {
  const surface = useRef(createDragSurface()).current;

  useEffect(() => {
    const { current } = elementRef;
    if (!current) return;
    const pointer = createPointerObservables(current);
    const touch = createTouchObservables(current);
    let activeDrag: null | DragMovement = null;
    let rect: null | DOMRect = null;
    const subs = [
      pointer.all
        .pipe(rxjs.filter(e => e.pointerType !== 'touch'))
        .subscribe(event => {
          event.preventDefault();
          switch (event.type) {
            case 'pointerdown':
              if (current instanceof HTMLElement)
                current.focus();
              current.setPointerCapture(event.pointerId);
              activeDrag = surface.startDrag(
                new three.Vector2(event.offsetX, event.offsetY)
              );
              return;
            case 'pointermove':
              if (activeDrag) {
                activeDrag.move(new three.Vector2(event.movementX, event.movementY));
              }
              return;
            case 'pointerup':
              if (activeDrag) {
                current.releasePointerCapture(event.pointerId);
                activeDrag.end();
                activeDrag = null;
              }
              return;
          }
        }),
      touch.all.subscribe((event) => {
        event.preventDefault()
        switch (event.type) {
          case 'touchstart': {
            const first = event.targetTouches.item(0);
            if (!first)
              return;
            if (current instanceof HTMLElement)
              current.focus();
            rect = current.getBoundingClientRect();
            const offset = new three.Vector2(first.clientX - rect.x, first.clientY - rect.y);
            activeDrag = surface.startDrag(offset);
            return;
          }
          case 'touchcancel':
          case 'touchend':
            if (activeDrag) {
              activeDrag.end();
              activeDrag = null;
              rect = null;
            }
            return;
          case 'touchmove': {
            const first = event.targetTouches.item(0);
            if (!first || !activeDrag || !rect)
              return;
            const offset = new three.Vector2(
              first.clientX - rect.x,
              first.clientY - rect.y
            );
            activeDrag.set(offset);
          }
        }
      })
    ];

    return () => {
      subs.map((s) => s.unsubscribe());
    };
  }, deps);

  return surface;
};
