import { act, kayo } from "../deps.ts";
import { FileItem, DirectoryItem } from "../models.ts";

export type FileBrowserProps = {
  files: FileItem[],
  directories: DirectoryItem[],
};

export const FileBrowser: act.Component<FileBrowserProps> = ({
  files,
  directories,
}) => {
  const topLevelDirectories = directories.filter(d => !d.parentDirectoryId);
  return null;
};


export const useFileKayoTree = () => {
  
}