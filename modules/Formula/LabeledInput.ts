import { act } from "./deps.ts"
// @deno-types="vite-css"
import styles from './LabeledInput.module.css';
import { useMemo } from "https://esm.sh/@lukekaalim/act@2.6.0";
const { h, useState } = act;

export type LabeledInputProps<TInputValueType, TInputType> = {
  label: string,
  value: TInputValueType,
  disabled?: boolean,
  type?: TInputType,
  onInput?: (value: TInputValueType, event: InputEvent) => unknown,
}

export const LabeledTextInput: act.Component<
  LabeledInputProps<string, ('text' | 'password')>
> = ({
  label,
  value,
  disabled,
  type = 'text',
  onInput: onInputProp,
}) => {
  const onInput = useMemo(() => (event: InputEvent) => {
    const input = event.currentTarget as HTMLInputElement;
    onInputProp && onInputProp(input.value, event);
  }, [onInputProp])

  return h('label', { class: styles.labeledInput }, [
    h('div', { }, label),
    h('input', { type, onInput, value, disabled }),
  ])
}