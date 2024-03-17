import { act, actCommon } from "../deps.ts";
import { EditorProps } from './props.ts';
import * as inputs from '../inputs/mod.ts';
import { LabelBlock } from '../LabelBlock.ts';

// @deno-types="vite-css"
import classes from './basic.module.css';
import {  } from "../deps.ts";

const { h } = act;
const { useId } = actCommon;

export const NumberEditor: act.Component<EditorProps<number>> = ({ label, ...props }) => {
  const id = useId();

  return [
    h(LabelBlock, { label: { ...label, type: 'number' }, id }),
    h(inputs.NumberInput, { ...props, className: classes.number, id })
  ]
};

export const TextEditor: act.Component<EditorProps<string>> = ({ label, ...props }) => {
  const id = useId();

  return [
    h(LabelBlock, { label: { ...label, type: 'text' }, id }),
    h(inputs.TextInput, { ...props, className: classes.text, id })
  ]
};
