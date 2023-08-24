import { act } from "./deps.ts";
// @deno-types="vite-css"
import styles from './kayo.module.css';

const { h } = act;

export const CenterLayout: act.Component = ({ children }) => {
  return h('div', { class: styles.centerLayout }, children)
};
