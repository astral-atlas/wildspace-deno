import { UploadButton } from '../../../Artifact/mod.ts';
import { act, actCommon, universe, journal } from '../../deps.ts';
import { FileContent } from "../../models.ts";
import { FileItemC } from '../../models.ts';
import { AssetWizard } from "wizard/mod.ts";

const { h } = act;
const { useAsync } = actCommon;

export type OmniWizardProps = {
  onFileContentUpdate?: (content: FileContent) => unknown,
  file: FileItemC,

  universe: universe.Backend,
  gameC: journal.GameController
}

export const OmniWizard: act.Component<OmniWizardProps> = ({ file, onFileContentUpdate, universe, gameC }) => {  
  const content = useAsync(async () => file.content.type === 'asset' && file.content.assetId &&
    gameC.artifact.downloadAsset(gameC.gameId, file.content.assetId), [file, gameC])
  const assetInfo = useAsync(async () => file.content.type === 'asset' && file.content.assetId &&
    universe.artifact.assets.service.read({ gameId: gameC.gameId, assetId: file.content.assetId }), [file, gameC])


  switch (file.content.type) {
    case 'asset':
      if (!file.content.assetId)
        return h(UploadButton, { async onUpload(asset) {
          onFileContentUpdate && onFileContentUpdate({ type: 'asset', assetId: asset.id });
        }, gameId: gameC.gameId, artifact: gameC.artifact });
      return !!content && !!assetInfo && h(AssetWizard, { content, type: assetInfo.contentType });
    default:
      return 'No Wizard for this file type!';
  }
};