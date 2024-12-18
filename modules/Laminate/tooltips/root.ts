import { act } from "atlas-renderer";
import { ScreenSpaceService } from "../screenspace";
import { Tooltip, TooltipID, TooltipService } from "./service";
import { Rect, Vec } from "space";
import { TooltipDebug } from "./debug";
import { useCalcVisibleTooltips } from "./visible";
import { Map } from "immutable";
import { placeTooltip } from "./placement";

export type TooltipsRootProps = {
  service: TooltipService,
  screen: ScreenSpaceService
};


export const TooltipsRoot: act.Component<TooltipsRootProps> = ({ service, screen }) => {
  const visible = useCalcVisibleTooltips(service);

  const [tooltipPlacements, setTooltipPlacements] = act.useState<Map<TooltipID, Rect<2>>>(Map());

  act.useEffect(() => {
    setTooltipPlacements(prevPlacements => {
      return Map(visible.map(tooltip => {
        const prevPlacement = prevPlacements.get(tooltip.id);
        if (prevPlacement)
          return [tooltip.id, prevPlacement];
        return [tooltip.id, placeTooltip(screen, tooltip)];
      }))
    })
  }, [visible])

  return [
    visible.map(tooltip => {
      const placement = tooltipPlacements.get(tooltip.id);
      if (!placement)
        return null;

      return act.h(TooltipRender, { key: tooltip.id, tooltip, screen, placement })
    }),
    act.h(TooltipDebug, { key: 'debug', service, screen, tooltipPlacements })
  ];
}

export type TooltipRenderProps = {
  tooltip: Tooltip,
  screen: ScreenSpaceService,
  placement: Rect<2>,
}

export const TooltipRender: act.Component<TooltipRenderProps> = ({ tooltip, screen, placement }) => {

  return act.h('div', {
    style: { position: 'absolute', transform: `translate(${placement.position.x}px, ${placement.position.y}px)`}
  }, tooltip.content);
};
