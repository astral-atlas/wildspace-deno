import { LabelBlock } from "../LabelBlock.ts";
import { act } from "../deps.ts";
import { EditorLabel } from "../label.ts";

// @deno-types="vite-css"
import classes from './external.module.css';

const { h } = act;

export const ExternalEditor: act.Component<{ label: EditorLabel }> = ({
  label,
  children
}) => {
  return [
    h(LabelBlock, { label }),
    h('div', { className: classes.external },
      h('div', { className: classes.inner }, children))
  ]
};