import { DryEraseChannel } from "../channel/mod.ts";
import { createMutableState, updateMutableState, WhiteboardMutableState } from "../state.ts";
import { act, actCommon, rxjs, three } from "../deps.ts";
import { ServerProtocol } from "../protocol/mod.ts";

const { useState, useEffect, useMemo } = act;

export type WhiteboardLocalStateUpdate = {
  data: WhiteboardMutableState,
  message: ServerProtocol;
};

export type WhiteboardLocalState = {
  channel: DryEraseChannel;
  data: WhiteboardMutableState;
  camera: three.Vector2;

  updates: rxjs.Observable<WhiteboardLocalStateUpdate>;

  close: () => void;
};

const modes = ["panning", "drawing", "sticking"] as const;
export type WhiteboardEditorState = {
  mode: (typeof modes)[number]
};

export const createWhiteboardLocalState = (channel: DryEraseChannel) => {
  const updates = new rxjs.Subject<WhiteboardLocalStateUpdate>();

  const close = () => {
    subscription.unsubscribe();
  };

  const state: WhiteboardLocalState = {
    channel,
    data: createMutableState(),
    camera: new three.Vector2(),
    close,
    updates,
  };

  const subscription = channel.recieve.subscribe((message) => {
    updateMutableState(state.data, message);
    updates.next({ data: state.data, message });
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
  channel: DryEraseChannel,
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

export type WhiteboardSelector<T> = (state: WhiteboardMutableState, prev: T) => T;

export const useWhiteboardSelector = <T>(
  state: WhiteboardLocalState,
  selector: WhiteboardSelector<T>,
  initialValue: T,
  isEqual?: (a: T, b: T) => boolean,
): T => {
  const source: actCommon.SelectorSource<WhiteboardMutableState> = useMemo(() => ({
    retrieve: () => state.data,
    changes: state.updates,
  }), [state]);

  return actCommon.useSelector(source, selector, initialValue, isEqual);
};
