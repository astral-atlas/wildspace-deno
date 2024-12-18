import { Rect, Vec } from "space";
import { ScreenSpaceService } from "../screenspace";
import { Tooltip } from "./service";
import { TooltipAnchor } from "./anchor";

const getAnchorRect = (screen: ScreenSpaceService, anchor: TooltipAnchor) => {
  switch (anchor.type) {
    case 'element':
      return ScreenSpaceService.getDomElementRect(screen, anchor.element);
    case 'screen-space':
      return anchor.space;
  }
}

export const placeTooltip = (screen: ScreenSpaceService, tooltip: Tooltip) => {
  const anchorRect = getAnchorRect(screen, tooltip.anchor);
  
  // place above anchor rect
  const y = anchorRect.position.y - tooltip.size.y;

  return Rect.new2(
    Vec.new2(anchorRect.position.x, y),
    tooltip.size,
  )
};
