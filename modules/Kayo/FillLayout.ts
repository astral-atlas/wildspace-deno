import { act } from "./deps.ts";

const { h } = act;

export const FillLayout: act.Component = ({ children }) => {
  return h('div', { }, children)
};