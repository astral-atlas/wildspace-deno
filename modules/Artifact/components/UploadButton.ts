import { act } from "../deps.ts";
import { Asset } from "../models.ts";
import { Service } from "../service.ts";

const { h, useState } = act;

export type UploadButtonProps = {
  gameId: string,
  artifact: Service,

  accept?: string,

  disabled?: boolean,
  onUpload?: (asset: Asset) => unknown,
  label?: act.ElementNode,
};

export const UploadButton: act.Component<UploadButtonProps> = ({
  gameId,
  accept,
  artifact,
  onUpload = () => {},
  label = `Upload ${accept || 'Asset'}`,
  disabled,
}) => {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [state, setState] = useState<'pending' | 'uploaded' | 'error'>('pending');

  const onClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    if (accept)
      input.accept = accept;
    input.multiple = false;
    input.addEventListener('input', async () => {
      const file = input.files && input.files.item(0);
      if (!file)
        return;
      setState('pending');
      const asset = await artifact.uploadAsset(gameId, file);
      setState('uploaded');
      setAsset(asset);
      onUpload(asset);
    })
    input.click();
  };

  return [
    h('button', {
      onClick,
      disabled: disabled || (asset && state === 'pending'),
    }, label)
  ];
}