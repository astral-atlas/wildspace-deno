import { act, actCommon, desk, journal } from "../../deps.ts";
import { JengaBlock } from "../../jenga.ts";
import { jengaToScreenSpace } from "./screenSpace.ts";
const { h } = act;

export type JengaBlockRendererProps = {
  gameController: journal.GameController,
  block: JengaBlock;
  screenSize: desk.Vector2,
  onClick?: (event: MouseEvent) => unknown,
};

const createDOMStyles = (block: JengaBlock, screenSizeRect: desk.Rect, imageURL?: string | null) => {
  return {
    position: 'absolute',
    top: `${screenSizeRect.position.y}px`,
    left: `${screenSizeRect.position.x}px`,
    height: (screenSizeRect.size.y) + 'px',
    width: (screenSizeRect.size.x) + 'px',

    backgroundColor: `${block.styles.backgroundColor}`,
    backgroundImage: imageURL && `url(${imageURL})`,
    backgroundSize: '100% 100%',
    backgroundPosition: 'center center',

    color: `${block.styles.textColor}`,
    fontFamily: block.styles.fontFamily,
    fontSize: block.styles.fontSize + "px",
    fontWeight: block.styles.fontWeight,

    boxShadow: block.styles.shadow === 'none' ? 'initial' :
     [
      `${block.styles.shadow.offset.x}px`,
      `${block.styles.shadow.offset.y}px`,
      `${block.styles.shadow.blurStrength}px`,
      `${block.styles.shadow.color}`,
     ].join(' '),
    backdropFilter: block.styles.backgroundBlur === 'none' ? 'inital' :
     `blur(${block.styles.backgroundBlur.strength}px)`,

    whiteSpace: 'pre-wrap',
    overflow: 'auto',

    border: `1px solid ${block.styles.borderColor}`,
    borderRadius: `${block.styles.borderRadius}px`
  };
};

export const JengaBlockRenderer: act.Component<JengaBlockRendererProps> = ({
  block,
  gameController,
  screenSize,
  onClick = () => {}
}) => {
  const screenSizeRect = jengaToScreenSpace(block.rect, screenSize);

  const imageContentAsset = actCommon.useAsync(async () => {
    if (block.imageContent === 'none')
      return null;
    return await gameController.artifact.downloadAsset(
      gameController.gameId,
      block.imageContent.assetId
    );
  }, [gameController.gameId, block.imageContent])

  const { imageURL } = actCommon.useDisposable(() => {
    if (!imageContentAsset)
      return { imageURL: null };
    const imageURL = URL.createObjectURL(imageContentAsset);
    return {
      imageURL,
      dispose: () => {
        URL.revokeObjectURL(imageURL)
      },
    }
  }, [imageContentAsset]);

  return h('div', {
    onClick,
    style: createDOMStyles(block, screenSizeRect, imageURL)
  }, block.textContent);
}
