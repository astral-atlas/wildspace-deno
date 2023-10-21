import { LocalState } from "./useLocalState.ts";
import { WhiteboardRenderer } from "./useWhiteboardRenderer.ts";
import { useWhiteboardStateSelector } from "./useWhiteboardStateSelector.ts";

export const useWhiteboardObjects = (localState: LocalState) => {
  useWhiteboardStateSelector(localState, ({ stickers, notes }) => {
    return {
      stickers: stickers.toArray(),
      notes: notes.toArray(),
    };
  }, null)
};


export const WhiteboardObjectRenderer = () => {

};
