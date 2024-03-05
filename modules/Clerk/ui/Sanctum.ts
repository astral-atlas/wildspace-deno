import { act, journal, universe, actCommon } from "../deps.ts";
import { FileContent } from "../models.ts";
import { FileItem } from "../models.ts";
import { FileItemID } from "../models.ts";
import { FileBrowser } from './FileBrowser.ts';
import { OmniWizard } from "./mod.ts";
import { FileBrowserEvent } from "./mod.ts";
import { useFileSystem } from "./useFileSystem.ts";

// @deno-types="vite-css"
import styles from './Sanctum.module.css';

const { h } = act;

export type SanctumProps = {
  gameC: journal.GameController,
  universe: universe.Backend,
}

export const Sanctum: act.Component<SanctumProps> = ({ gameC, universe }) => {
  const sys = useFileSystem(universe, gameC);

  if (!sys.files || !sys.userRoot)
    return null;

  const { files, userRoot } = sys;
  
  const onEvent = (event: FileBrowserEvent) => {
    switch (event.type) {
      case 'rename':
        return sys.actions.rename(event.id, event.newName);
      case 'delete': 
        return sys.actions.remove(event.id)
      case 'create':
        return sys.actions.create(event.parentId, event.name, event.content);
    }
  };
  const selection = actCommon.useSelection<FileItemID>();

  const selectedFiles = selection.selectedItems.map(s => files.find(f => f.id === s));
  const selectedFile = selectedFiles[0];
  const onFileContentUpdate = (content: FileContent) => {
    if (!selectedFile)
      return;
    sys.actions.setContent(selectedFile.id, content);
  }

  return h('div', { className: styles.sanctum }, [
    h('div', { className: styles.browser }, [
      h(FileBrowser, { files, rootFile: userRoot.fileId, selection, onEvent }),
    ]),
    h('div', { className: styles.wizard }, [
      !!selectedFile && h(OmniWizard, { key: selectedFile.id, file: selectedFile, onFileContentUpdate, universe, gameC })
    ]),
  ]);
}