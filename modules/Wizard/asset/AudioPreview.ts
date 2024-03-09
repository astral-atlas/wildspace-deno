import { actCommon } from "../deps.ts";
import { act } from "../deps.ts";
import { WizardAssetPreviewProps } from "../assetPreviews/props.ts";

const { h } = act;

export const AudioPreview: act.Component<WizardAssetPreviewProps> = ({
  content
}) => {
  
  const contentURL = actCommon.useBlobURL(content);

  return h('audio', { src: contentURL.href, controls: true })
};
