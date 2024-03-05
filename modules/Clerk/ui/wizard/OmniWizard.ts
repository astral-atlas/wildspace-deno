import { act, actCommon, universe, journal } from '../../deps.ts';
import { FileContent } from "../../models.ts";
import { FileItemC } from '../../models.ts';
import { AssetWizard } from "./AssetWizard.ts";

const { h } = act;
const { useAsync } = actCommon;

export type OmniWizardProps = {
  onFileContentUpdate?: (content: FileContent) => unknown,
  file: FileItemC,

  universe: universe.Backend,
  gameC: journal.GameController
}

export const OmniWizard: act.Component<OmniWizardProps> = ({ file, onFileContentUpdate, universe, gameC }) => {

  switch (file.content.type) {
    case 'asset':
      return h(AssetWizard, {
        file: { ...file, content: file.content },
        onFileContentUpdate, universe, gameC
      });
    default:
      return 'No Wizard for this file type!';
  }
};