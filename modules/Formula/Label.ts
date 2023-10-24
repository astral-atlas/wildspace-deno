import { m, act } from "./deps.ts";
// @deno-types="vite-css"
import styles from './LabeledInput.module.css';

const { h } = act;

export type LabeledInputProps = {
  text: string,
}

export const Label: act.Component<LabeledInputProps> = ({ text, children }) => {
  return h('label', { class: styles.labeledInput }, [
    h('div', { }, text),
    children,
  ])
}