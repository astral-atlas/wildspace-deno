// @deno-types="vite-css"
import styles from "./kayo.module.css";
import { act } from "./deps.ts";

export const HorizontalFrame: act.Component = ({ children }) => {
  return act.h('div', { className: styles.horizontalFrame }, children);
}