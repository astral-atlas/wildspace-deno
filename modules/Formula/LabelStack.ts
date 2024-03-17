import { act } from "./deps.ts";
import { EditorLabel } from "./label.ts";

// @deno-types="vite-css"
import classes from './LabelStack.module.css';

const { h } = act;

export type LabelStackProps = {
  label: EditorLabel,
  className?: string,
}

export const LabelStack: act.Component<LabelStackProps> = ({ children, label, className }) => {
  return h('label', { classList: [classes.stack, className] }, [
    h('div', { className: classes.name }, label.name),
    children,
  ])
};