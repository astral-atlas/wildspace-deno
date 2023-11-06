import { act } from "../deps.ts";
import { InputProps, useInputEventHandler } from "./props.ts";

const { h } = act;

export type SelectInputProps = InputProps<string> & {
  options: { [key: string]: string } | [string, string][] | string[];
};

const optionsToEntries = (
  values: SelectInputProps["options"]
): [string, string][] => {
  if (!Array.isArray(values)) return Object.entries(values);
  if (values.length < 1) return [];
  const sample = values[0];
  if (Array.isArray(sample)) {
    const arrayValueEntries = values as [string, string][];
    return arrayValueEntries;
  } else {
    const arrayValues = values as string[];
    return arrayValues.map((v) => [v, v]);
  }
};

const getSelectValue = (e: HTMLSelectElement) => {
  return e.value;
};

export const SelectInput: act.Component<SelectInputProps> = ({
  options,
  onInput = (_) => {},
  value,
  disabled,
}) => {
  const entries = optionsToEntries(options);
  const onSelectInput = useInputEventHandler(
    onInput,
    HTMLSelectElement,
    getSelectValue
  );

  return h("select",
    { onInput: onSelectInput, disabled },
    entries.map(([name, entryValue]) =>
      h("option", {
        selected: value === entryValue
      }, name)
    )
  );
};
