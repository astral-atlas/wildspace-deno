import { act } from "atlas-renderer";
import { Map } from 'immutable';
import { Tooltip, TooltipID, TooltipService } from "./service";

const calcVisibleTooltips = (tooltip: Tooltip, allTooltips: Map<TooltipID, Tooltip>): Tooltip[] => {
  if (tooltip.parentId) {
    const parent = allTooltips.get(tooltip.parentId);
    if (!parent)
      throw new Error();

    return [tooltip, ...calcVisibleTooltips(parent, allTooltips)];
  }
  return [tooltip];
}

export const useCalcVisibleTooltips = (service: TooltipService) => {
  return act.useMemo(() => {
    if (!service.active)
      return [];
    return calcVisibleTooltips(service.active, service.all);
  }, [service])
}