import { act } from "../deps";
import { ClickableAction } from "./action";

const { h } = act;

export const ActionButton: act.Component<{ action: ClickableAction }> = ({ action }) => {
  return h('button', {}, action.content);
}