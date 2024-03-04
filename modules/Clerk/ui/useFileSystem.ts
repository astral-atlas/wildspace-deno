import { universe, journal, act, actCommon } from '../deps.ts';
import { FileContent } from "../models.ts";
import { FileItemID } from '../models.ts';

const { useState, useEffect } = act;

export const useFileSystem = (
  universe: universe.Backend,
  gameC: journal.GameController,

  deps: act.Deps = [],
) => {
  const { gameId, userId } = gameC;
  // This hook uses a primitive "refresh" timer
  const [refreshTime, setRefresh] = useState(Date.now())
  
  const files = actCommon.useAsync(() =>
    universe.clerk.files.service.list({
      gameId
    }),
    [refreshTime]
  );
  const userRoot = actCommon.useAsync(() =>
    universe.clerk.roots.service.read({ gameId, userId, }),
    [refreshTime]
  );

  const create = async (parentId: FileItemID, name: string, content: FileContent) => {
    if (!files)
      return;
    const folder = files.find(f => f.id === parentId);
    if (!folder || folder.content.type !== 'directory')
      return null;
    const folderContent = folder.content;

    const newFile = await universe.clerk.files.service.create({
      gameId,
      name,
      parentId: folder.id,
      content,
    });
    await universe.clerk.files.service.update({
      gameId,
      fileId: parentId,
    }, {
      content: { type: 'directory', children: [...folderContent.children, newFile.id] },
      name: null,
    })
    refresh();
  };
  const remove = async (fileId: FileItemID) => {
    if (!files)
      return;
    const file = files.find(f => f.id === fileId);
    if (!file)
      return;
    const parent = files.find(f => f.id === file.parentId);
    if (!parent || parent.content.type !== 'directory')
      return;
    await universe.clerk.files.service.update({
      gameId,
      fileId: parent.id,
    }, {
      content: {
        ...parent.content,
        children: parent.content.children.filter(c => c !== file.id)
      },
      name: null,
    });
    await universe.clerk.files.service.delete({
      gameId,
      fileId: file.id,
    });
    refresh();
  };
  const rename = async (id: FileItemID, newName: string) => {
    await universe.clerk.files.service.update({
      gameId,
      fileId: id,
    }, {
      content: null,
      name: newName,
    });
    refresh();
  };
  const setContent = async (id: FileItemID, newContent: FileContent) => {
    if (!files)
      return;
    const prevFile = files.find(f => f.id === id);
    if (!prevFile || prevFile.content.type !== newContent.type)
      throw new Error(`Content does not match (or file does not exist)`);
    await universe.clerk.files.service.update({
      gameId,
      fileId: id,
    }, {
      content: newContent,
      name: null,
    });
    refresh();
  }
  const refresh = () => {
    setRefresh(Date.now())
  }

  useEffect(() => {
    refresh();
  }, deps)

  const actions = { rename, remove, create, refresh, setContent };

  return {
    files,
    userRoot,
    actions,
  };
};
