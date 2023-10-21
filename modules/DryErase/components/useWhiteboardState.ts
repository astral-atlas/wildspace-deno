import { WhiteboardChannel } from "../channel.ts";
import { reduceWhiteboardStateFromServer, WhiteboardState } from "../state.ts";
import { act, actCommon, rxjs, three } from "../deps.ts";
import { Note, WhiteboardCursor, WhiteboardStroke } from "../models.ts";
import { Protocol } from "../protocol.ts";

const { h, useState, useEffect, useMemo } = act;

export type WhiteboardLocalStateUpdate = {
  prev: WhiteboardState;
  next: WhiteboardState;
  message: Protocol["message"]["server"];
};

export type WhiteboardLocalState = {
  channel: WhiteboardChannel;
  data: WhiteboardState;
  camera: three.Vector2;

  updates: rxjs.Observable<WhiteboardLocalStateUpdate>;

  close: () => void;
};

const modes = ["panning", "drawing", "noting", "sticking"] as const;
export type WhiteboardEditorState = {
  mode: (typeof modes)[number]
};

export const createWhiteboardLocalState = (channel: WhiteboardChannel) => {
  const updates = new rxjs.Subject<WhiteboardLocalStateUpdate>();

  const close = () => {
    subscription.unsubscribe();
  };

  const state: WhiteboardLocalState = {
    channel,
    data: {
      cursors: [],
      strokes: [],
      notes: [],
    },
    camera: new three.Vector2(),
    close,
    updates,
  };

  const subscription = channel.recieve.subscribe((message) => {
    const prev = state.data;
    const next = reduceWhiteboardStateFromServer(prev, message);
    state.data = next;
    updates.next({ prev, next, message });
  });

  return state;
};

/**
 * This hook provides access to the mutable object,
 * whiteboard state. The object itself is stable, but
 * the properties of it are reasigned every update.
 * 
 * You should use useWhiteboardSelector to gain
 * access to a reactive value.
 * @param channel 
 * @returns 
 */
export const useWhiteboardLocalState = (
  channel: WhiteboardChannel,
): null | WhiteboardLocalState => {
  const [localState, setLocalState] = useState<null | WhiteboardLocalState>(
    null,
  );

  useEffect(() => {
    const localState = createWhiteboardLocalState(channel);
    setLocalState(localState);
    return () => {
      localState.close();
    };
  }, []);

  return localState;
};

export type WhiteboardSelector<T> = (state: WhiteboardState, prev: T) => T;

export const useWhiteboardSelector = <T>(
  state: WhiteboardLocalState,
  selector: WhiteboardSelector<T>,
  initialValue: T,
  isEqual?: (a: T, b: T) => boolean,
): T => {
  const source: actCommon.SelectorSource<WhiteboardState> = useMemo(() => ({
    retrieve: () => state.data,
    changes: state.updates,
  }), [state]);

  return actCommon.useSelector(source, selector, initialValue, isEqual);
};
export const useWhiteboardState = (
  channel: WhiteboardChannel,
): WhiteboardState => {
  const [strokes, setStrokes] = useState<WhiteboardStroke[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [cursors, setCursors] = useState<WhiteboardCursor[]>([]);

  useEffect(() => {
    const subscription = channel.recieve.subscribe((event) => {
      switch (event.type) {
        case "initialize":
          return setCursors([...event.cursors]);
        case "pointer-spawn":
          return setCursors((cs) => [...cs, event.cursor]);
        case "pointer-move":
          return setCursors((cs) =>
            cs.map((c) =>
              c.id === event.cursorId ? { ...c, position: event.position } : c
            )
          );
        case "stroke-create":
          return setStrokes((ss) => [...ss, event.stroke]);
        case "stroke-update":
          return setStrokes((ss) =>
            ss.map((s) => s.id === event.stroke.id ? event.stroke : s)
          );
        case "pointer-despawn":
          return setCursors((cs) => cs.filter((c) => c.id !== event.cursorId));
        case "note-create":
          return setNotes((ns) => [...ns, event.note]);
      }
    });
    return () => {
      subscription.unsubscribe();
    }
  }, [channel])

  return {
    cursors: [...new Map(cursors.map((c) => [c.id, c])).values()],
    strokes,
    notes,
  };
};
