import { act, network } from "../deps.ts";
import { Asset } from "../models.ts";
import { ArtifactService } from "../service.ts";

const { h, useState } = act;

export type UploadButtonProps = {
  artifact: ArtifactService,
  http: network.HTTPClient,

  accept: string,

  disabled?: boolean,
  onUpload?: (asset: Asset) => unknown,
  label?: act.ElementNode,
};

export const UploadButton: act.Component<UploadButtonProps> = ({
  accept,
  http,
  artifact,
  onUpload = () => {},
  label = `Upload ${accept}`,
  disabled,
}) => {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [state, setState] = useState<'pending' | 'uploaded' | 'error'>('pending');

  const onClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = false;
    input.addEventListener('input', async () => {
      const file = input.files && input.files.item(0);
      if (!file)
        return;
      const asset = await artifact.assets.create({
        ownerId: 'me',
        contentType: file.type,
        contentLength: file.size,
        state: null,
        users: [],
      })
      setAsset(asset);
      setState('pending');
      const url = await artifact.url.createUploadURL(asset.id, 'me');
      const result = await http.request({
        url,
        method: 'PUT',
        headers: {},
        body: file.stream(),
      });
      setState(result.status === 200 ? 'uploaded' : 'error');
      if (result.status === 200) {
        onUpload(asset);
      }
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