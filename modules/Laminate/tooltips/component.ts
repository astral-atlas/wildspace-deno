import { act } from "atlas-renderer";
import { tooltipContext } from "./context";
import { Vec } from "space";

export const InlineTooltip: act.Component<{ content: act.ElementNode }> = ({ children, content }) => {
  const ref = act.useRef<HTMLElement | null>(null);

  const tooltip = act.useContext(tooltipContext)

  act.useEffect(() => {
    if (!tooltip.service || !ref.current)
      return;

    tooltip.service.add(content, Vec.new2(100, 100), { type: 'element', element: ref.current }, null);
  }, [])

  return act.h('span', { ref }, children)
};
