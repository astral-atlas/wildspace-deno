import { act } from "../deps.ts";

const { useMemo } = act;

export type InputProps<TValue> = {
  value: TValue,
  onInput?: (value: TValue, event?: InputEvent) => unknown,

  disabled?: boolean,
};

export const useInputEventHandler = <TElement extends HTMLElement, TValue>(
  onInput: (value: TValue, event?: InputEvent) => unknown,
  htmlElement: { new (): TElement },
  calcValue: (element: TElement) => TValue
) => {
  return useMemo(() => (event: InputEvent) => {
    if (event.target instanceof htmlElement) {
      const value = calcValue(event.target)
      onInput(value, event);
    }
  }, [onInput, htmlElement, calcValue]);
}