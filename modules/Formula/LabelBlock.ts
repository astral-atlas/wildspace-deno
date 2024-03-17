import { act } from "./deps.ts";
import { LabelRow } from "./Row.ts";
// @deno-types="vite-css"
import classes from './LabelBlock.module.css';
import { EditorLabel } from "./label.ts";

const { h } = act;

export type LabelBlockProps = {
  label: EditorLabel,
  id?: string,
}

export const LabelBlock: act.Component<LabelBlockProps> = ({
  label: { name, description, type, optional },
  id,
}) => {
  return [
    !!(name || optional || type) && h(LabelRow, { htmlFor: id }, [
      !!name && h('span', { className: classes.name }, name),
      !!optional && h('span', { className: classes.optional }, 'Optional'),
      !!type && h('span', { className: classes.type }, type),
    ]),
    !!description && h(LabelRow, { htmlFor: id },
      h('p', { className: classes.description }, description))
  ]
}