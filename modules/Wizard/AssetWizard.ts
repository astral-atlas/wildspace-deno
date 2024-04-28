import { ImageWizard } from './asset/ImageWizard.ts';
import { ModelWizard } from './asset/ModelWizard.ts';
import { act } from './deps.ts';

export type AssetWizardProps = {
  type: string,
  content: Blob,

  onContentUpdate?: (nextBlob: Blob) => unknown,
};

export const AssetWizard: act.Component<AssetWizardProps> = ({
  type,
  content
}) => {
  if (type.startsWith('image/'))  
    return act.h(ImageWizard, { content });
  if (type.startsWith('model/'))
    return act.h(ModelWizard, { content });

  return null;
}