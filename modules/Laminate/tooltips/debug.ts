import { act } from "atlas-renderer";
import { TooltipsRootProps } from "./root";
import { LaminateDebugPortal } from "../debug";
import { TooltipAnchor } from "./anchor";
import { frame } from "../deps";
import { ScreenSpaceService } from "../screenspace";
import { Map } from "immutable";
import { TooltipID } from "./service";
import { Rect } from "space";

export const TooltipDebug: act.Component<TooltipsRootProps & { tooltipPlacements: Map<TooltipID, Rect<2>>}> = ({ service, screen, tooltipPlacements }) => {
  
  return act.h(LaminateDebugPortal, {}, [
    tooltipPlacements.toArray().map(([id, rect]) => {

      return act.h('rect', {
        stroke: 'black',
        'stroke-width': '1px',
        'stroke-style': 'dotted',
        fill: 'none',
        x: rect.position.x + 'px', y: rect.position.y + 'px', 
        width: rect.size.x + 'px', height: rect.size.y + 'px',
      });
    }),
    service.all.map(tooltip => {
      if (tooltip.anchor.type === 'element')
        return act.h(TooltipElementAnchorDebug, { screen, anchor: tooltip.anchor });

      return act.h('rect', {
        stroke: 'black',
        'stroke-width': '1px',
        'stroke-style': 'dotted',
        fill: 'none',
        x: tooltip.anchor.space.position.x + 'px', y: tooltip.anchor.space.position.y + 'px', 
        width: tooltip.anchor.space.size.x + 'px', height: tooltip.anchor.space.size.y + 'px',
      });
    }).valueSeq().toArray()
  ])
}

type TooltipElementAnchorDebug = {
  anchor: Extract<TooltipAnchor, { type: 'element' }>,
  screen: ScreenSpaceService,
}

export const TooltipElementAnchorDebug: act.Component<TooltipElementAnchorDebug> = ({ anchor, screen }) => { 
  const ref = act.useRef<SVGRectElement | null>(null);

  frame.useSimulation('tooltip:debug', () => {
    const rect = ref.current;
    if (!rect)
      return;

    const anchorRect = ScreenSpaceService.getDomElementRect(screen, anchor.element);
    
    rect.setAttribute('x', anchorRect.position.x + 'px');
    rect.setAttribute('y', anchorRect.position.y + 'px');
    rect.setAttribute('width', anchorRect.size.x + 'px');
    rect.setAttribute('height', anchorRect.size.y + 'px');
  }, [])


  return act.h('rect', {
    ref,
    stroke: 'black',
    'stroke-width': '1px',
    'stroke-style': 'dotted',
    fill: 'none',
  });
}