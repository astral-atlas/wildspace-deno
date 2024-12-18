import { Map, Set } from 'immutable';

import { act } from "atlas-renderer";
import { Rect, Vec } from "space";
import { TooltipAnchor } from "./anchor";
import { OpaqueID } from "ts-common";
import { ScreenSpaceService } from "../screenspace";
import { useCalcActiveTooltips } from './active';


export type TooltipID = OpaqueID<'tooltip'>;


export type Tooltip = {
  id: TooltipID,

  anchor: TooltipAnchor,
  size: Vec<2>,

  content: act.ElementNode,

  priority: number,

  /**
   * Tooltips can have "parent" tooltips - a "parent" is still considered
   * to be active if either it _or_ one of it's children is active.
   * */
  parentId: TooltipID | null,
}

export type TooltipService = {
  all: Map<TooltipID, Tooltip>,
  active: Tooltip | null,


  add: (
    content: act.ElementNode,
    size: Vec<2>,

    anchor: TooltipAnchor,
    parentId: TooltipID | null
  ) => Tooltip
};


export const useTooltipService = (screen: ScreenSpaceService): TooltipService => {
  const [tooltips, setTooltips] = act.useState<Map<TooltipID, Tooltip>>(Map());

  const active = useCalcActiveTooltips(tooltips, screen);

  /**
   * Register an anchor and a tooltip
   * @param anchor 
   * @param parentId 
   */
  const addTooltip = (
    content: act.ElementNode,
    size: Vec<2>,

    anchor: TooltipAnchor,
    parentId: TooltipID | null
  ): Tooltip => {
    const id = OpaqueID.new<'tooltip'>();

    const tooltip: Tooltip = {
      id,
      content,
      size,
      parentId,
      anchor,
      priority: 0,
    }

    setTooltips(ts => ts.set(id, tooltip));

    return tooltip;
  }

  return {
    all: tooltips,
    active,
    add: addTooltip,
  }
};