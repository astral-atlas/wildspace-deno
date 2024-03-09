// @deno-types="vite-css"
import styles from './CrystalBall.module.css';
import { act } from './deps.ts'

const { h } = act;

export const CrystalBall: act.Component = ({ children }) => {
  return h('div', { className: styles.crystalBall }, children);
}

export const CrystalBallPanel: act.Component = ({ children }) => {
  return h('div', { className: styles.crystalBallPanel }, children);
}