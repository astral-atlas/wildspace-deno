import { rect2 } from "space/rects";
import { FramePresenter } from "../../ComponentDoc/FramePresenter";
import { urlSheet } from "../../ComponentDoc/markdown";
import { act } from "../deps";
import { getScreenspaceRect, useEyeballEngine } from "./engine";
import { Socket } from "./Socket";
import { TooltipSpan } from "./TooltipProvider";
import { vec2 } from "space/vectors";

const EyeballDemo = () => {
  const engine = useEyeballEngine();

  const onOpenDialogueClick = () => {
    engine.newDialogue((d) => {
      return act.h('dialog', { open: true, style: { backgroundColor: 'white', padding: '16px', position: 'relative' } }, [
        act.h('div', {}, 'Hello!'),
        act.h('button', { onClick: () => engine.closeDialogue(d.id) }, 'Close Dialogue')
      ])
    })
  }
  const onDropdownButtonClick = (e: MouseEvent) => {
    e.preventDefault()
    if (!(e.currentTarget instanceof HTMLElement))
      return;

    const ssBoundaryDomRect = getScreenspaceRect(engine, e.currentTarget);
    if (!ssBoundaryDomRect)
      return;

    engine.newDropdown(() => act.h('ol', { style: { background: 'grey', margin: 0 } }, [
      act.h('li', {}, act.h('button', { onClick: onDropdownButtonClick }, 'Dropdown!')),
      act.h('li', {}, act.h('button', { onClick: onDropdownButtonClick }, 'Dropdown B')),
      act.h('li', {}, act.h('button', { onClick: onDropdownButtonClick }, 'Dropdown C')),
      act.h('li', {}, act.h('button', { onClick: onDropdownButtonClick }, 'Dropdown D')),
    ]), ssBoundaryDomRect).id
  }
  const onOpenContextClick = (e: MouseEvent) => {
    e.preventDefault()
    const cursorPosition = engine.pointerPositionRef.current;
    const target = rect2({ ...cursorPosition }, vec2(0, 0));

    engine.newDropdown(() => act.h('ol', { style: { background: 'grey', margin: 0 } }, [
      act.h('li', {}, act.h('button', { onClick: onDropdownButtonClick }, 'Dropdown!')),
      act.h('li', {}, act.h('button', { onClick: onDropdownButtonClick }, 'Dropdown B')),
      act.h('li', {}, act.h('button', { onClick: onDropdownButtonClick }, 'Dropdown C')),
      act.h('li', {}, act.h('button', { onClick: onDropdownButtonClick }, 'Dropdown D')),
    ]), target).id
  }

  return act.h(FramePresenter, {}, act.h(Socket, { engine }, [
    act.h('div', { onContextMenu: onOpenContextClick, style: { flex: 1 } }, [
      act.h('button', { onClick: onOpenDialogueClick }, 'Open optional Dialogue'),
      act.h('div', {}, [
        act.h(TooltipSpan, { renderTooltip: () => act.h('div', { style: {
          padding: '4px',
          background: 'black',
          color: 'white',
          border: '2px solid black',
          borderRadius: '4px',
        } }, 'Tooltip') }, 'Hover for a tooltip'),
      ]),

      act.h('p', {}, [
        `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut `, act.h(QuickTip) ,` et dolore `, act.h(QuickTip) ,` magna aliqua. Ut enim ad minim veniam,
        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat. Duis aute irure dolor`, act.h(QuickTip) ,` in reprehenderit `, act.h(QuickTip) ,` in voluptate velit
        esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
        cupidatat non `, act.h(QuickTip) ,` proident, sunt in culpa qui officia deserunt mollit
        anim id est laborum.`
      ]),

      act.h('div', {}, [
        'Hover for a ',
        act.h(TooltipSpan, { renderTooltip: () => act.h('div', { style: {
          padding: '4px',
          background: 'blue',
          color: 'white',
          border: '2px solid black',
          borderRadius: '4px',
        } }, 'Here is a different tooltip') }, act.h('span', { style: { fontWeight: 'bold', textDecoration: 'underline' }}, 'tooltip')),
      ]),

      act.h('button', { onClick: onDropdownButtonClick }, 'Open Context Menu')
    ]),
  ]))
}

const QuickTip: act.Component = ({ children }) => {
  return act.h(TooltipSpan, { renderTooltip: () => act.h(TooltipContent) },
    act.h('span', { style: { fontWeight: 'bold', textDecoration: 'underline' }}, 'Tooltip'))
}

const TooltipContent = () => {
  const [color, setColor] = act.useState(`hsl(${Math.random() * 360}deg, 50%, 50%)`);

  return act.h('div', {
    style: {
      padding: '4px',
      background: color,
      color: 'white',
      border: '2px solid black',
      borderRadius: '4px',
    }
  }, 'Tip of the tool to ya!');
}

export const eyeballDoc = urlSheet('Eyeball', new URL('./readme.md', import.meta.url), {
  EyeballDemo
}, null, 'Kayo');