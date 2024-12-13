import { mut, MutableVec, vec2 } from "space";
import { ObservableMap, OpaqueID } from "ts-common";
import { act, rxjs } from "../../deps";

export type ScreenElementID = OpaqueID<"screen-element">;
export type ScreenElement = {
  id: ScreenElementID,
  node: act.ElementNode
}

/**
 * The screenspace service controls mouse positions
 * and overlay elements
 */
export type ScreenSpaceService = {
  elements: ObservableMap<ScreenElementID, ScreenElement>,
  mousePosition: MutableVec<2>,
}

export const createScreenspaceService = (): ScreenSpaceService => {
  const mousePosition = mut(vec2());
  const elements = ObservableMap.create<ScreenElementID, ScreenElement>();

  return {
    mousePosition,
    elements,
  }
};
