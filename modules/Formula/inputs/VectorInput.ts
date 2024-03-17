import { act, three } from "../deps.ts";
import { InputProps } from "./props.ts";
// @deno-types="vite-css"
import styles from './VectorInput.module.css'

import * as inputs from './InputElement.ts';
import { LabelStack } from "../LabelStack.ts";

const { h } = act;

type NumberStackProps = {
  onInput: (value: number) => unknown,
  value: number,
  name: string,
  disabled?: boolean,
}

const NumberStack: act.Component<NumberStackProps> = ({ onInput, value, name, disabled }) => {
  return h(LabelStack, { label: { name }, className: styles.stack },
    h(inputs.NumberInput, { value, onInput, disabled }),
  );
}

export const Vector3Input: act.Component<InputProps<three.Vector3>> = ({
  value,
  onInput,
  disabled,
}) => {
  const onNumberInput = (dimension: 'x' | 'y' | 'z') => (value: number, event?: InputEvent) => {
    if (!onInput)
      return;

    const v = new three.Vector3(value);

    switch (dimension) {
      case 'x':
        return onInput(v.setX(value), event);
      case 'y':
        return onInput(v.setY(value), event);
      case 'z':
        return onInput(v.setZ(value), event);
    }
  }

  return h('div', { className: styles.vectorInput }, [
    h(NumberStack, { value: value.x, onInput: onNumberInput('x'), name: 'x', disabled }),
    h(NumberStack, { value: value.y, onInput: onNumberInput('y'), name: 'y', disabled }),
    h(NumberStack, { value: value.z, onInput: onNumberInput('z'), name: 'z', disabled }),
  ]);
}

export const Vector2Input: act.Component<InputProps<three.Vector2>> = ({
  value,
  onInput,
  disabled
}) => {
  const onNumberInput = (dimension: 'x' | 'y') => (value: number, event?: InputEvent) => {
    if (!onInput)
      return;

    const v = new three.Vector2(value);

    switch (dimension) {
      case 'x':
        return onInput(v.setX(value), event);
      case 'y':
        return onInput(v.setY(value), event);
    }
  }

  return  h('div', { className: styles.vectorInput }, [
    h(NumberStack, { value: value.x, onInput: onNumberInput('x'), name: 'x', disabled }),
    h(NumberStack, { value: value.y, onInput: onNumberInput('y'), name: 'y', disabled }),
  ]);
}