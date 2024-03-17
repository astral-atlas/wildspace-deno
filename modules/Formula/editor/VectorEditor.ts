import { act, three } from "../deps.ts";
import { EditorProps } from './props.ts';

import * as inputs from '../inputs/mod.ts';
import { LabelBlock } from '../LabelBlock.ts';

const { h } = act;

export const Vector2Editor: act.Component<EditorProps<three.Vector2>> = ({
  label,
  ...props
}) => {
  return [
    h(LabelBlock, { label: { ...label, type: label.type || 'Vector2' } }),
    h(inputs.Vector2Input, props),
  ]
}
export const Vector3Editor: act.Component<EditorProps<three.Vector3>> = ({
  label,
  ...props
}) => {
  return [
    h(LabelBlock, { label: { ...label, type: label.type || 'Vector3' } }),
    h(inputs.Vector3Input, props),
  ]
}