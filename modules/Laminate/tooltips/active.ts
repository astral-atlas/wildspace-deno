import { Rect } from "space";
import { act, frame } from "../deps";
import { ScreenSpaceService } from "../screenspace";
import { Tooltip, TooltipID } from "./service";
import { Map, Set } from 'immutable';
import { createCleanupTask } from "janitor";

export const useCalcActiveTooltips = (tooltips: Map<TooltipID, Tooltip>, screen: ScreenSpaceService) => {
  // For ease, split up "Screen Space" tooltips and "Element" based tooltips
  const tooltipRects = act.useMemo(() => {
    return tooltips
      .map(t => t.anchor.type === 'screen-space' && t.anchor.space)
      .filter(t => !!t);
  }, [tooltips])
  const tooltipElements = act.useMemo(() => {
    return tooltips
      .map(t => t.anchor.type === 'element' && t.anchor.element)
      .filter(t => !!t);
  }, [tooltips]);

  const [screenspaceTooltips, setScreenspaceTooltips] = act.useState<Set<TooltipID>>(Set());

  
  frame.useAnimation('test-screen-tooltips', () => {
    setScreenspaceTooltips(prevTooltips => {
      const nextTooltips = Set(tooltipRects
        .filter((rect) => Rect.pointWithin(rect, screen.mousePosition))
        .keys())

      if (nextTooltips.equals(prevTooltips))
        return prevTooltips;
      return nextTooltips;
    })

  }, [tooltipRects]);

  // Add and remove event listeners to the element
  const [elementTooltips, setElementTooltips] = act.useState<Set<TooltipID>>(Set());
  act.useEffect(() => {
    const cleanup = createCleanupTask();

    for (const [id, element] of tooltipElements) {
      const onEnter = () => {
        setElementTooltips(prev => prev.add(id));
      }
      const onLeave = () => {
        setElementTooltips(prev => prev.delete(id));
      }
      element.addEventListener('pointerenter', onEnter);
      element.addEventListener('pointerleave', onLeave);
      cleanup.register(() => {
        element.removeEventListener('pointerenter', onEnter);
        element.removeEventListener('pointerleave', onLeave);
      });
    }

    return () => cleanup.run();
  }, [tooltipElements]);

  return act.useMemo(() => {
    let activeTooltip: Tooltip | null = null;

    for (const tooltipId of elementTooltips.concat(screenspaceTooltips)) {
      const tooltip = tooltips.get(tooltipId) || null;
      if ((!activeTooltip) || (tooltip && tooltip.priority > activeTooltip.priority))  {
        activeTooltip = tooltip;
      }
    }

    return activeTooltip;
  }, [elementTooltips, screenspaceTooltips])
}