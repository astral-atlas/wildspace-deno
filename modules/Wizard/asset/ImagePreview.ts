import { actCommon as ac } from "../deps.ts";
import { act } from "../deps.ts";
import { WizardAssetPreviewProps } from "./props.ts";

const { h } = act;

export const ImagePreview: act.Component<WizardAssetPreviewProps> = ({ content }) => {
  
  const url = ac.useBlobURL(content);

  return h('div', { style: { display: 'flex', flex: 1 } }, [
    h('img', {
      src: url.href,
      style: { height: '300px', width: 'max-content', margin: 'auto', boxShadow: '0 0 8px black' }
    })
  ]);
}