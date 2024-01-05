import { act, desk, journal } from "../deps.ts";
import { JengaBlock, JengaSlideContent } from "../jenga.ts";
import { JengaBlockRenderer } from "./jenga/block.ts";
import { EditableJengaBlockRenderer } from "./jenga/editing.ts";
import { JengaEditorPanel } from "./jenga/panel.ts";
import { JengaToolbar } from "./jenga/toolbar.ts";
const { h, useEffect, useRef, useState } = act;

export type JengaSlideRendererProps = {
  content: JengaSlideContent;

  editable?: boolean;
  gameController: journal.GameController,
  onEdit?: (updatedContent: JengaSlideContent) => unknown;
};

export const JengaSlideRenderer: act.Component<JengaSlideRendererProps> = ({
  content,
  gameController,
  editable = false,
  onEdit = _ => {}
}) => {
  const [screenSize, setScreenSize] = useState<null | desk.Vector2>(null);
  const ref = useRef<null | HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    const { current: container } = ref;
    if (!container)
      return;
    const setSize = () => {
      const containerRect = container.getBoundingClientRect();
      const screenSize = {
        x: containerRect.width,
        y: containerRect.height,
      };
      setScreenSize(screenSize);
    }
    const mo = new ResizeObserver(setSize);
    mo.observe(container, { box: 'border-box' })
    setSize();

    return () => {
      mo.disconnect();
    }
  }, []);

  const onSelectedBlockEdit = (nextBlock: JengaBlock) => {
    onEdit({
      ...content,
      blocks: content.blocks.map((b, index) => index === selectedIndex ? nextBlock : b),
    })
  };
  const selectedBlock = content.blocks[selectedIndex];
  const onClick = (e: MouseEvent) => {
    if (e.target !== e.currentTarget)
      return;
    setSelectedIndex(-1);
  }
  
  return h('div', { ref, style: { flex: 1, overflow: 'hidden', height: '100%' } }, [
    screenSize && h("div", {
      onClick,
      style: {
        width: `${screenSize.x}px`,
        height: `${screenSize.y}px`,
        position: 'absolute',
        border: '1px solid black'
      } }, [
      content.blocks.map((block, index) => {
        const onClick = (e: MouseEvent) => {
          e.preventDefault();
          setSelectedIndex(index)
        }
        return h(JengaBlockRenderer, { block, screenSize, onClick, gameController })
      }),
      !!editable && selectedBlock && h(EditableJengaBlockRenderer, {
        block: selectedBlock, onBlockEdit: onSelectedBlockEdit,
        screenSize,
      }),
    ]),
    !!editable && h(JengaToolbar, { onEdit, content }),
    !!editable && h(JengaEditorPanel, {
      gameController,
      onContentEdit: onEdit, content,
      selectedIndex, onSelectedIndexChange: setSelectedIndex
    })
  ]);
};

