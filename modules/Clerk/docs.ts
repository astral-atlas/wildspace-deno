import { DocSheet, FramePresenter, markdownToSheet } from "../ComponentDoc/mod.ts";
import { SystemComponentsPreview } from "../Data/DataDoc/mod.ts";
import { universeDocContext } from "../Universe/docs.ts";
import { act, actCommon, data } from "./deps.ts";
// @deno-types="vite-text"
import readme from "./readme.md?raw";
import { FileBrowser, FileBrowserEvent } from "./ui/mod.ts";
import { fileSystemDef, gameRootsSystemDef } from './system.ts';
import { OverlayRoot } from "../Kayo/mod.ts";

const { h, useState } = act;

const fileBrowserDemo = () => {
  const universe = universeDocContext.useDocContext();
  const { demo: { game, user }, backend: { clerk } } = universe;

  const [now, setNow] = useState(Date.now())

  const files = actCommon.useAsync(() =>
    universe.backend.clerk.files.service.list({
      gameId: game.id
    }),
    [now]
  );
  const userRoot = actCommon.useAsync(() =>
    universe.backend.clerk.roots.service.read({
      gameId: game.id,
      userId: user.id,
    }),
    [now]
  );

  if (!files)
    return null;
  
  const rootFile = userRoot && userRoot.fileId;
  const onEvent = async (event: FileBrowserEvent) => {
    switch (event.type) {
      case 'rename': {
        return universe.backend.clerk.files.service.update({
          gameId: universe.demo.game.id,
          fileId: event.id,
        }, {
          content: null,
          name: event.newName,
        }).then(() => setNow(Date.now()))
      }
      case 'delete': {
        const file = files.find(f => f.id === event.id);
        if (!file)
          return;
        const parent = files.find(f => f.id === file.parentId);
        if (!parent || parent.content.type !== 'directory')
          return;
        await clerk.files.service.update({
          gameId: universe.demo.game.id,
          fileId: parent.id,
        }, {
          content: {
            ...parent.content,
            children: parent.content.children.filter(c => c !== file.id)
          },
          name: null,
        });
        await clerk.files.service.delete({
          gameId: universe.demo.game.id,
          fileId: file.id,
        });
        return setNow(Date.now());
      }
      case 'create': {
        const folder = files.find(f => f.id === event.parentId);
        if (!folder || folder.content.type !== 'directory')
          return null;
        const content = folder.content;

        const newFile = await clerk.files.service.create({
          gameId: game.id,
          name: event.name,
          parentId: folder.id,
          content: event.content,
        });
        await clerk.files.service.update({
          gameId: game.id,
          fileId: event.parentId,
        }, {
          content: { type: 'directory', children: [...content.children, newFile.id] },
          name: null,
        })
        return setNow(Date.now())
      }
    }
  };

  return [
    !userRoot && h('button', { async onClick() {
      const file = await clerk.files.service.create({
        gameId: game.id,
        content: { type: 'directory', children: [] },
        name: 'Root',
        parentId: null,
      })
      await universe.backend.clerk.roots.service.create({
        gameId: game.id,
        userId: user.id,
        fileId: file.id,
      });
      setNow(Date.now());
    } }, 'Create Roots'),
    h(FramePresenter, {}, [
      h(OverlayRoot, {}, [
        rootFile && h(FileBrowser, { files, rootFile, onEvent }),
      ])
    ]),
  ];
};

const filesService = () => {
  const universe = universeDocContext.useDocContext();
  const { demo: { game, user }, backend: { clerk } } = universe;

  return h(SystemComponentsPreview, {
    systemDef: fileSystemDef,
    world: universe.world,
    components: clerk.files as unknown as data.simpleSystem.Components<data.simpleSystem.SimpleSystemType>
  });
}
const rootService = () => {
  const universe = universeDocContext.useDocContext();
  const { demo: { game, user }, backend: { clerk } } = universe;

  return h(SystemComponentsPreview, {
    systemDef: gameRootsSystemDef,
    world: universe.world,
    components: clerk.roots as unknown as data.simpleSystem.Components<data.simpleSystem.SimpleSystemType>
  });
}

const directives = {
  fileBrowserDemo,
  filesService,
  rootService,
};

export const clerkDocs: DocSheet[] = [
  markdownToSheet("Clerk", readme, directives, null, 'Universe'),
];
