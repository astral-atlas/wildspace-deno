import { Rect } from "space";
import { ScreenElementID, ScreenElementService } from "./elements";
import { ScreenSpaceService } from "./screenspace";
import { act } from "../../deps";
import { OpaqueID } from "ts-common";

export type TooltipID = OpaqueID<'tooltip'>;

export type TooltipAnchor =
  | { type: 'screen-space', space: Rect<2> }
  | { type: 'element', element: HTMLElement }

export type Tooltip = {
  id: TooltipID,
  screenElementId: ScreenElementID,

  anchor: TooltipAnchor,
  content: act.ElementNode,

  /**
   * Tooltips can have "parent" tooltips - a "parent" is still considered
   * to be active if either it _or_ one of it's children is active.
   * */
  parentId: TooltipID | null,
}

export const createTooltipService = (sss: ScreenSpaceService) => {
  /**
   * Register an anchor and a tooltip
   * @param anchor 
   * @param parentId 
   */
  const addTooltip = (content: act.ElementNode, anchor: TooltipAnchor, parentId: ScreenElementID | null) => {
    const id = OpaqueID.new<'tooltip'>();
  }

  const remove = () => {

  };

  const updateScreenspace = () => {

  };

  return {
    registerAnchor,
    
    remove,
  }
};
