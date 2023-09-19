import { act } from "./deps.ts";
// @deno-types="vite-css"
import styles from "./kayo.module.css";
const { h } = act;

export type ToolbarLayoutProps = {
  toolbarChildren: act.ElementNode;

  direction?: "left" | "right" | "up" | "down";
};

const directionRowStyles = {
  left: { left: 0, flexDirection: "column", top: 0, bottom: 0 },
  right: { right: 0, flexDirection: "column", top: 0, bottom: 0 },
  up: { top: 0, flexDirection: "row", left: 0, right: 0 },
  down: { bottom: 0, flexDirection: "row", left: 0, right: 0 },
} as const;
const directionToolbarStyles = {
  left: { flexDirection: "column" },
  right: { flexDirection: "column" },
  up: { flexDirection: "row" },
  down: { flexDirection: "row" },
};

export type ToolbarProps = {
  class?: string,
  style?: { [style: string]: unknown },
  direction?: "left" | "right" | "up" | "down";
};

export const Toolbar: act.Component<ToolbarProps> = ({
  direction = 'down',
  children,
  style: extraStyles,
  class: className,
}) => {
  const toolbarStyles = act.useMemo(() => ({
    ...directionToolbarStyles[direction],
    ...(extraStyles || {})
  }), [extraStyles])

  return h("div",
    { class: styles.toolbarRow, style: directionRowStyles[direction] },
    h("div",
      { classList: [styles.toolbar, className], style: toolbarStyles },
      children
    )
  );
}

export const ToolbarLayout: act.Component<ToolbarLayoutProps> = ({
  toolbarChildren,
  children,
  direction = "down",
}) => {
  return h("div", { class: styles.toolbarLayout }, [
    children,
    h(Toolbar, { direction }, toolbarChildren)
  ]);
};

const directionFixedRowStyles = {
  left: { left: 0, flexDirection: "column", top: 0, bottom: 0 },
  right: { right: 0, flexDirection: "column", top: 0, bottom: 0 },
  up: { top: 0, flexDirection: "row", left: 0, right: 0 },
  down: { bottom: 0, flexDirection: "row", left: 0, right: 0 },
} as const;

export const FixedToolbar: act.Component<ToolbarLayoutProps> = ({
  direction = "down",
  children,
}) => {
  return h("div",
    { class: styles.fixedToolbarRow, style: directionFixedRowStyles[direction] },
    children
  );
};
