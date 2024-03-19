import { Component, h, useState } from "@lukekaalim/act";

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
    classList: [styles.label, invertTextColor && styles.invert],
    style: { ...labelStyle },
  }, labelElement));
}

export type FixedBlockProps = {
  width: number,
  height: number,

  invertTextColor?: boolean,
  backgroundImage?: string,
  color?: string,
  style?: Record<string, unknown>,
  labelStyle?: Record<string, unknown>,
  label?: string,
}

export const FixedBlock: Component<FixedBlockProps> = ({
  width,
  height,

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
    class: styles.fixedBlock,
    style: {
      backgroundColor: color || randomColor,
      backgroundImage,
      width: width + 'px',
      height: height + 'px',
      ...style,
    }
  }, labelElement && h('div', {
    classList: [styles.label, invertTextColor && styles.invert],
    style: { ...labelStyle },
  }, labelElement));
}

export type FlexBlockProps = {
  invertTextColor?: boolean,
  backgroundImage?: string,
  color?: string,
  style?: Record<string, unknown>,
  labelStyle?: Record<string, unknown>,
  label?: string,
}
export const FlexBlock: Component<FlexBlockProps> = ({
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
    class: styles.flexBlock,
    style: {
      backgroundColor: color || randomColor,
      backgroundImage,
      ...style,
    }
  }, labelElement && h('div', {
    classList: [styles.label, invertTextColor && styles.invert],
    style: { ...labelStyle },
  }, labelElement));
};