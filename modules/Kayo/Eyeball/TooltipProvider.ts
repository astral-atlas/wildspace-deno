import { rect2 } from "space/rects";
import { act } from "../deps";
import { useEyeballContext } from "./Socket";
import { vec2 } from "space/vectors";
import { OpaqueID } from "./engine";

export type TooltipSpanProps = {
  renderTooltip: () => act.ElementNode
}

export const TooltipSpan: act.Component<TooltipSpanProps> = ({ children, renderTooltip }) => {
  const eyeball = useEyeballContext();

  const [tooltipId, setTooltipId] = act.useState<OpaqueID<"TooltipID"> | null>(null);

  const onPointerEnter = (e: PointerEvent) => {
    if (!(e.currentTarget instanceof HTMLElement))
      return;

    const tooltip = eyeball.newTooltip(renderTooltip, e.currentTarget);

    setTooltipId(tooltip.id);
  };

  return act.h('span', { onPointerEnter }, children);
}