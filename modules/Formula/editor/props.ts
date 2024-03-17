import { EditorLabel } from "../label.ts";

export type EditorProps<T> = {
  label: EditorLabel,

  value: T,
  onInput?: (nextValue: T) => unknown,

  disabled?: boolean,
};
