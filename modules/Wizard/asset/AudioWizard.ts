import { actCommon } from "../deps.ts";
import { act } from "../deps.ts";

const { h } = act;

export const AudioWizard: act.Component<{ content: Blob }> = ({
  content
}) => {
  const contentURL = actCommon.useBlobURL(content);

  return h('audio', { src: contentURL.href, controls: true })
};
