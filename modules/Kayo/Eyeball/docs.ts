import { FramePresenter } from "../../ComponentDoc/FramePresenter";
import { urlSheet } from "../../ComponentDoc/markdown";
import { act } from "../deps";
import { useEyeballEngine } from "./engine";
import { Socket } from "./Socket";

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
    act.h('button', { onClick: onOpenDialogueClick }, 'Open optional Dialogue')
  ]))
}

export const eyeballDoc = urlSheet('Eyeball', new URL('./readme.md', import.meta.url), {
  EyeballDemo
}, null, 'Kayo');