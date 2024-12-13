import { act, frame, rxjs } from "./deps";

import { Rect, Vec } from "space";
import { ObservableSet, OpaqueID } from "ts-common";
import { Map, Set } from 'immutable'
import { createCleanupTask } from 'janitor'

import { ScreenSpaceService, ScreenElementID } from "./screenspace";
import { FrameScheduler, useFrameScheduler, useSimulation } from "frame-scheduler";
import { LaminateDebugPortal } from "./debug";

export type TooltipID = OpaqueID<'tooltip'>;

/**
 * A Tooltip's Anchor is basically what is used to "Trigger" it.
 * 
 * It can either be a fixed spot on the screen
 */
export type TooltipAnchor =
  | { type: 'screen-space', space: Rect<2> }
  | { type: 'element', element: HTMLElement }

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
};

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
  useSimulation('test-screen-tooltips', () => {
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
  }
};

export type TooltipsRootProps = {
  service: TooltipService
};

const calcVisibleTooltips = (tooltip: Tooltip, allTooltips: Map<TooltipID, Tooltip>): Tooltip[] => {
  if (tooltip.parentId) {
    const parent = allTooltips.get(tooltip.parentId);
    if (!parent)
      throw new Error();

    return [tooltip, ...calcVisibleTooltips(parent, allTooltips)];
  }
  return [tooltip];
}

const useCalcVisibleTooltips = (service: TooltipService) => {
  return act.useMemo(() => {
    if (!service.active)
      return [];
    return calcVisibleTooltips(service.active, service.all);
  }, [service])
}

export const TooltipsRoot: act.Component<TooltipsRootProps> = ({ service }) => {
  
  const visible = useCalcVisibleTooltips(service);

  return [
    visible.map(tooltip => tooltip.content)
  ];
}

export const TooltipRender = () => {

};

export const TooltipDebug: act.Component<TooltipsRootProps> = ({ service }) => {
  
  return act.h(LaminateDebugPortal, {}, [
    act.h('text', {}, 'Hello!')
  ])
}