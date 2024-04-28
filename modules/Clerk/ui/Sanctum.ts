import { act, journal, universe, actCommon, kayo } from "../deps.ts";
import { FileContent } from "../models.ts";
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
  const directory = !!selectedFile && selectedFile.content.type === "directory" && selectedFile;

  const directoryActions: kayo.MenuItem[] = directory ? [
    { type: "submenu", content: 'New', submenu: { id: "core/create", items: [
      { type: 'action', content: "Asset", onClick(e) {
        sys.actions.create(directory.id, "New Asset", { type: 'asset', assetId: null })
      }, },
      { type: 'action', content: "Directory", onClick(e) {
        sys.actions.create(directory.id, "New Directory", { type: 'directory', children: [] })
      }, },
    ]} },
  ] : [];
  const fileActions: kayo.MenuItem[] = selectedFile ? [
    { type: 'submenu', content: 'File', submenu: { id: 'core/file', items: [
      { type: 'action', content: "Rename" },
      { type: 'action', content: "Delete" },
    ] }}
  ] : []

  return [
    h(kayo.MenuBar, { menu: { id: 'core', items: [
      ...fileActions,
      ...directoryActions
    ].filter((x): x is kayo.MenuItem => !!x) } }),
    h('div', { className: styles.sanctum }, [
      h('div', { className: styles.browser }, [
        h(FileBrowser, { files, rootFile: userRoot.fileId, selection, onEvent }),
      ]),
      h('div', { className: styles.wizard }, [
        !!selectedFile && h(OmniWizard, { key: selectedFile.id, file: selectedFile, onFileContentUpdate, universe, gameC })
      ]),
    ])
  ];
}