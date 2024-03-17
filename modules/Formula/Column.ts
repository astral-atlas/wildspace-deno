import { act } from "./deps.ts";
// @deno-types="vite-css";
import classes from './Column.module.css';

export const Column: act.Component = ({ children }) => {
  return act.h('div', { className: classes.column }, children)
}