import { GameController } from "../../../Journal/mod.ts";
import { actCommon } from "../../deps.ts";
import { universe } from "../../deps.ts";
import { act } from "../../deps.ts";
import { FileContent } from "../../models.ts";
import { FileItemT } from "../../models.ts";

import * as previews from './assetPreviews/mod.ts';


// @deno-types="vite-css"
import styles from './AssetWizard.module.css';

const { h, useState, useEffect, useRef, useContext } = act;
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

  const onCreateAssetClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    const onSubmitFile = () => {
      if (!input.files)
        return;

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

  const empty = [
    h('div', { className: styles.actionBar },
      h('button', { onClick: onCreateAssetClick }, 'Select Asset to Upload'),
    ),
  ];
  const staging = stagingFile && [
    h('div', { className: styles.actionBar }, [
      h('button', { onClick: onCreateAssetClick }, 'Select Asset to Upload'),
      h('button', { onClick: onUploadStagingAsset }, 'Upload Asset'),
    ]
    ),
    h('div', { className: styles.preview }, [
      h(PreviewAsset, { contentType: stagingFile.type, content: stagingFile })
    ]),
  ]
  const existing = asset && [
    h('div', { className: styles.actionBar },
      h('button', { onClick: onClearAsset }, 'Clear Asset')
    ),
    !!assetBlob && h('div', { className: styles.preview }, [
      h(PreviewAsset, { contentType: asset.contentType, content: assetBlob })
    ]),
  ];

  return [
    !asset && !stagingFile && empty,
    !asset && stagingFile && staging,
    asset && existing,
  ];
};

const PreviewAsset = ({ contentType, content }: { contentType: string, content: Blob }) => {
  if (contentType.startsWith('image/'))
    return h(previews.ImagePreview, { content });
  if (contentType.startsWith('video/')) 
    return h(previews.AudioPreview, { content });
  if (contentType.startsWith('audio/'))
    return h(previews.AudioPreview, { content });
  if (contentType.startsWith('model/'))
    return h(previews.GLTFPreview, { content });

  return null;
};