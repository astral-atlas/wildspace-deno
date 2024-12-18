import { Rect } from "space";

/**
 * A Tooltip's Anchor is basically what is used to "Trigger" it.
 * 
 * It can either be a fixed spot on the screen
 */
export type TooltipAnchor =
  | { type: 'screen-space', space: Rect<2> }
  | { type: 'element', element: HTMLElement }
  