import { Mut, Rect, Vec } from "space";
import { ObservableMap, OpaqueID } from "ts-common";
import { act, rxjs } from "./deps";

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
  /** Position of the "Screen" in document coordinates */
  rect: Mut<Rect<2>>,

  elements: ObservableMap<ScreenElementID, ScreenElement>,
  mousePosition: Mut<Vec<2>>,
}

export const createScreenspaceService = (): ScreenSpaceService => {
  const mousePosition = Mut.set(Vec.new2());
  const rect = Mut.set(Rect.new2(Vec.new2(), Vec.new2()));

  const elements = ObservableMap.create<ScreenElementID, ScreenElement>();

  return {
    rect,
    mousePosition,
    elements,
  }
};
