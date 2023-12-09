import { act, kayo } from "../../deps.ts";
import { JengaSlideContent } from "../../jenga.ts";
const { h } = act;

export type JengaToolbarProps = {
  content: JengaSlideContent;
  onEdit: (updatedContent: JengaSlideContent) => unknown;
};
export const JengaToolbar: act.Component<JengaToolbarProps> = ({ onEdit, content }) => {
  const onClickAddBlock = () => {
    onEdit({
      ...content,
      blocks: [
        ...content.blocks,
        {
          styles: {
            textColor: '#000000',
            backgroundColor: '#FFFFFF',
            borderColor: '#000000',
            fontFamily: 'Roboto',
            borderRadius: 0,
            fontSize: 16,
            fontWeight: 'normal',
            shadow: 'none',
            backgroundBlur: 'none',
          },
          textContent: 'New Block',
          imageContent: 'none',
          rect: { position: { x: 0, y: 0}, size: { x: 1, y: 1 } }
        }
      ]
    })
  };

  return h(kayo.Toolbar, {}, [
    h("button", { onClick: onClickAddBlock }, "Add Block")
  ]);
};
