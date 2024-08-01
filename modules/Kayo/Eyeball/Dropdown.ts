import { act } from "../deps";
import { DropdownEntry } from "./engine";

export type DropdownContainerProps = {
  entry: DropdownEntry,
};

export const DropdownContainer: act.Component<DropdownContainerProps> = ({ entry }) => {
  return entry.render(entry);
};
