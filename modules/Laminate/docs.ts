import { doc, FramePresenter, urlSheet } from '@astral-atlas/component-doc';
import { act } from 'atlas-renderer';
import { TooltipDebug, TooltipRender, TooltipsRoot, useTooltipService } from './tooltips';
import { LaminateDebug } from './debug';
import { createScreenspaceService } from './screenspace';
import { Rect, Vec } from 'space';
import { InlineTooltip } from './tooltips/component';
import { tooltipContext } from './tooltips/context';

const SampleComponent = () => {
  return act.h('p', {}, [
    'This is a block of text ',
    'with a ', act.h(InlineTooltip, { content: act.h('strong', {}, 'Secret text!') }, 'Tooltip'),
    ' within it.'
  ]);
}

const Demo = () => {
  const screen = act.useMemo(() => createScreenspaceService(), []);
  const tooltips = useTooltipService(screen);


  const ref = act.useRef<HTMLElement | null>(null);

  act.useEffect(() => {
    screen.rootDomElement = ref.current;
  }, []);

  return act.h('div', {
    ref,
    style: { border: '1px solid black', width: '500px', height: '500px', position: 'relative' },
    onPointerMove: (e: PointerEvent) => {
      if (!ref.current)
        return;

      const parentRect = ref.current.getBoundingClientRect();
      
      screen.mousePosition.x = e.clientX - parentRect.left;
      screen.mousePosition.y = e.clientY - parentRect.top;
    }
  }, [
    act.h(LaminateDebug, { service : { screen, tooltips }},
      act.h(TooltipsRoot, { service: tooltips, screen })),

    act.h(tooltipContext.Provider, { value: { service: tooltips } }, act.h(SampleComponent))
  ]);
}

doc({
  id: 'Laminate',
  readmeURL: new URL('./readme.md', import.meta.url),
  directiveComponents: { Demo },
})