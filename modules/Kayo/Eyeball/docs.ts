import { FramePresenter } from "../../ComponentDoc/FramePresenter";
import { urlSheet } from "../../ComponentDoc/markdown";
import { act } from "../deps";
import { useEyeballEngine } from "./engine";
import { Socket } from "./Socket";
import { TooltipSpan } from "./TooltipProvider";

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

  return act.h(FramePresenter, {}, act.h(Socket, { engine }, [
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
  ]))
}

export const eyeballDoc = urlSheet('Eyeball', new URL('./readme.md', import.meta.url), {
  EyeballDemo
}, null, 'Kayo');