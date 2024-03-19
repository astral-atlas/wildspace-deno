import { h, useContext, useEffect, useRef } from "@lukekaalim/act";
import { DocSheet } from "../ComponentDoc/DocElement.ts";
import { useKeyboardElementRef } from "./mod.ts";
import { keyboardStateControllerContext } from "./keyboardStateController.ts";
// @deno-types="vite-css"
import docStyles from './docs.module.css';
import { useSimulation } from "../FrameScheduler/useSimulation.ts";

export const KeyboardDemo = () => {
  const keyboardRef = useRef(null);
  const outputRef = useRef<HTMLElement | null>(null);
  useKeyboardElementRef(keyboardRef)
  const controller = useContext(keyboardStateControllerContext);

  useSimulation('KeyboardDemo', () => {
    const { current: output } = outputRef;
    if (!output)
      return;
      output.innerText = [
      [...controller.keysDown]
    ].join('\n');
  }, [])

  useEffect(() => {
    const { current: output } = outputRef;
    if (!output)
      return;

    setInterval(() => {
    }, 50);
  }, [])

  return [
    h('div', { tabIndex: 0, ref: keyboardRef, class: docStyles.focusDemo }, 'Focus me and press keys!'),
    h('pre', { ref: outputRef })
  ];
};

export const keyboardDocs: DocSheet[] = [
  { id: 'Keyboard', elements: [
    { type: 'title', text: 'Keyboard' },
    { type: 'component', component: KeyboardDemo }
  ] }
];