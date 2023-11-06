import { m, act } from "./deps.ts";
// @deno-types="vite-css"
import styles from './LabeledInput.module.css';

const { h } = act;

export type LabeledInputProps = {
  text: string,
  inline?: boolean,
}

export const Label: act.Component<LabeledInputProps> = ({
  text, children,
  inline = false,
}) => {
  return h('label', { class: styles.labeledInput, style: { display: inline ? 'inline-block' : 'flex' } }, [
    h('div', { style: { display: inline ? 'inline-block' : 'block' } }, text),
    children,
  ])
}