import { OpaqueID } from "ts-common";
import { act, rxjs } from '../../deps';

export type ScreenElementID = OpaqueID<"screen-element">;
export type ScreenElement = {
  id: ScreenElementID,
  node: act.ElementNode
}

export type ScreenElementService = ReturnType<typeof createScreenElementService>;

export const createScreenElementService = () => {
  const elements = new Map<ScreenElementID, ScreenElement>();
  const updates = new rxjs.Subject<void>()

  const add = (node: act.ElementNode) => {
    const id = OpaqueID.new<'screen-element'>();
    const element: ScreenElement = {
      id,
      node
    }
    elements.set(id, element)
    updates.next();
    return element;
  };
  const remove = (id: ScreenElementID) => {
    if (elements.delete(id))
      updates.next();
  };

  return {
    elements,
    updates,
    add,
    remove,
  }
}