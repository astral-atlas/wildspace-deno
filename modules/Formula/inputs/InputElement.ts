import { act } from "../deps.ts";
import { InputProps, useInputEventHandler } from "./props.ts";

const { h } = act;

const getInputElementString = (e: HTMLInputElement | HTMLTextAreaElement) => {
  return e.value;
}
const getInputElementNumber = (e: HTMLInputElement) => {
  return e.valueAsNumber;
}

export type InputElementProps<T> = InputProps<T> & {
  placeholder?: T,
}

export const TextInput: act.Component<InputElementProps<string> & {
  area?: boolean
}> = ({
  value,
  onInput = (_) => {},

  disabled,
  placeholder,
  area,
}) => {
  const onInputEvent = useInputEventHandler(
    onInput,
    HTMLInputElement,
    getInputElementString,
  );
  const onTextAreaEvent = useInputEventHandler(
    onInput,
    HTMLTextAreaElement,
    getInputElementString,
  );

  if (area) {
    return h("textarea", {
      disabled,
      value,
      onInput: onTextAreaEvent,
    });
  }

  return h("input", {
    type: 'text',
    disabled,
    value,
    onInput: onInputEvent,
  });
};


export const NumberInput: act.Component<InputElementProps<number>> = ({
  value,
  onInput = (_) => {},

  disabled,
  placeholder,
}) => {
  const onInputEvent = useInputEventHandler(
    onInput,
    HTMLInputElement,
    getInputElementNumber,
  );

  return h("input", {
    type: 'number',
    disabled,
    value,
    onInput: onInputEvent,
  });
};
