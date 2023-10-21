import { WhiteboardChannel } from "../channel.ts";
import { rxjs } from "../deps.ts";
import { StateMap } from "../state.ts";

export type LocalState = {
  updates: rxjs.Observable<StateMap>,
  state: StateMap,
  channel: WhiteboardChannel,
};

export const useLocalState = () => {

};
