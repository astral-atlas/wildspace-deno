import { GameController } from "../../../Journal/mod.ts";
import { actCommon } from "../../deps.ts";
import { universe } from "../../deps.ts";
import { act } from "../../deps.ts";
import { FileContent } from "../../models.ts";
import { FileItemT } from "../../models.ts";
const { h, useState, useEffect } = act;
const { useAsync } = actCommon;

export type AssetWizardProps = {
  onFileContentUpdate?: (content: FileContent) => unknown,
  file: FileItemT<"asset">,
  universe: universe.Backend,
  gameC: GameController
}

export const AssetWizard: act.Component<AssetWizardProps> = ({ file, universe, onFileContentUpdate, gameC }) => {

  const [stagingFile, setStagingFile] = useState<File | null>(null);
  const asset = useAsync(async () => {
    if (!file.content.assetId)
      return null;
    console.log(universe.artifact.assets)
    const asset = await universe.artifact.assets.service.read({
      gameId: gameC.gameId,
      assetId: file.content.assetId
    });
    return asset;
  }, [file.content.assetId])
  const assetBlob = useAsync(async () => {
    if (!file.content.assetId)
      return;
    return await gameC.artifact.downloadAsset(gameC.gameId, file.content.assetId);
  }, [file.content.assetId])

  console.log({file,asset,assetBlob});

  

  const onCreateAssetClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    const onSubmitFile = (event: Event) => {
      if (!input.files)
        return;

      console.log(input.files[0], event);
      setStagingFile(input.files[0])
      input.removeEventListener('input', onSubmitFile);
    }
    input.addEventListener('input', onSubmitFile);
    input.click();
  };
  const onUploadStagingAsset = async () => {
    if (!stagingFile)
      return;
    const asset = await gameC.artifact.uploadAsset(gameC.gameId, stagingFile);
    onFileContentUpdate && onFileContentUpdate({ type: 'asset', assetId: asset.id });
  };
  const onClearAsset = () => {
    onFileContentUpdate && onFileContentUpdate({ type: 'asset', assetId: null });
  }

  return [
    stagingFile && [
      stagingFile.type.startsWith('image') && [
        h(ImagePreview, { file: stagingFile })
      ],
      h('pre', {}, JSON.stringify({
        name: stagingFile.name,
        size: stagingFile.size,
        type: stagingFile.type,
      })),
      h('button', { onClick: onUploadStagingAsset }, 'Upload Asset'),
    ],

    asset && [
      !!asset.contentType.startsWith('image') &&
      !!assetBlob && [
        h(ImagePreview, { file: assetBlob })
      ],
      h('pre', {}, JSON.stringify({
        name: asset.id,
        size: asset.contentLength,
        type: asset.contentType,
      })),
      h('button', { onClick: onClearAsset }, 'Clear Asset'),
    ],

    h('button', { onClick: onCreateAssetClick }, 'Select Asset to Upload'),
  ];
};

const ImagePreview = ({ file }: { file: Blob }) => {
  const [url, setURL] = useState<null | URL>(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setURL(new URL(url));
    return () => {
      URL.revokeObjectURL(url);
    }
  }, [file]);

  if (!url)
    return 'loading';

  return h('img', { src: url.href, style: { height: '300px', width: 'max-content' } })
}