import { Component, h, useState } from "https://esm.sh/@lukekaalim/act@2.6.0";

// @deno-types="vite-css"
import styles from './Blocks.module.css';

export type FillBlockProps = {
  invertTextColor?: boolean,
  backgroundImage?: string,
  color?: string,
  style?: Record<string, unknown>,
  labelStyle?: Record<string, unknown>,
  label?: string,
}

export const FillBlock: Component<FillBlockProps> = ({
  backgroundImage,
  color,
  label,
  style = {},
  labelStyle = {},
  invertTextColor = false,
  children
}) => {
  const [randomColor] = useState(() => `hsl(${Math.floor(Math.random() * 360)}deg, 50%, 50%)`)

  const labelElement = children || label;

  return h('div', {
    class: styles.fillBlock,
    style: {
      backgroundColor: color || randomColor,
      backgroundImage,
      ...style,
    }
  }, labelElement && h('div', {
    classList: [styles.fillBlockLabel, invertTextColor && styles.invert],
    style: { ...labelStyle },
  }, labelElement));
}