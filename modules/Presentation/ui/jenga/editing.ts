import { act, actCommon, desk, journal, kayo } from "../../deps.ts";
import { JengaBlock, JengaRect, JengaSlideContent } from "../../jenga.ts";
import { jengaToScreenSpace, screenToJengaSpace } from "./screenSpace.ts";
const { h, useEffect, useRef, useState } = act;

export type EditableJengaBlockRendererProps = {
  block: JengaBlock;
  screenSize: desk.Vector2,
  onBlockEdit: (nextBlock: JengaBlock) => unknown;
};
export const EditableJengaBlockRenderer: act.Component<EditableJengaBlockRendererProps> = ({
  block,
  onBlockEdit,
  screenSize,
}) => {
  const screenSizeRect = jengaToScreenSpace(block.rect, screenSize);
  const onResize = (nextRect: desk.Rect) => {
    onBlockEdit({
      ...block,
      rect: screenToJengaSpace(nextRect, screenSize)
    })
  }
  return h('div', { style: {
    position: 'absolute',
    transform: `translate(${screenSizeRect.position.x}px, ${screenSizeRect.position.y}px)`,
    height: (screenSizeRect.size.y) + 'px',
    width: (screenSizeRect.size.x) + 'px',
    pointerEvents: 'none',
    border: '1px dotted grey',
  }}, h(desk.ResizeRectControls, { rect: screenSizeRect, onResize }));
}
