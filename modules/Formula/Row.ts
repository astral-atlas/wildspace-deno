import { act } from "./deps.ts";
// @deno-types="vite-css";
import classes from './Row.module.css';

export const Row: act.Component = ({ children }) => {
  return act.h('div', { className: classes.row }, children)
}

export const LabelRow: act.Component<{ htmlFor?: string }> = ({ children, htmlFor }) => {
  return act.h('label', { className: classes.row, htmlFor }, children)
}