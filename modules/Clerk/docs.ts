import { DocSheet, FramePresenter, markdownToSheet } from "../ComponentDoc/mod.ts";
import { SystemComponentsPreview } from "../Data/DataDoc/mod.ts";
import { universeDocContext } from "../Universe/docs.ts";
import { act, actCommon, data } from "./deps.ts";
// @deno-types="vite-text"
import readme from "./readme.md?raw";
import { FileBrowser, FileBrowserEvent } from "./ui/mod.ts";
import { fileSystemDef, gameRootsSystemDef } from './system.ts';
import { OverlayRoot } from "../Kayo/mod.ts";
import * as ui from './ui/mod.ts';
import { journal } from "./deps.ts";
import { FileItemID, FileItemT } from "./models.ts";
import { useFileSystem } from "./ui/mod.ts";
import { FileContent } from "./models.ts";

const { h, useState } = act;
const { useAsync } = actCommon;

const fileBrowserDemo = () => {
  const universe = universeDocContext.useDocContext();
  const { demo: { game, user }, backend: { clerk } } = universe;

  const sys = useFileSystem(universe.backend, { gameId: game.id, userId: user.id } as any);

  const onEvent = (event: FileBrowserEvent) => {
    if (!sys)
      return;
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

  return [
    !sys.userRoot && h('button', { async onClick() {
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
      sys.actions.refresh();
    } }, 'Create Roots'),
    !!sys.userRoot && !!sys.files && h(FramePresenter, {}, [
      h(OverlayRoot, {}, [
        sys.userRoot.fileId && h(FileBrowser, {
          files: sys.files, rootFile: sys.userRoot.fileId, onEvent, selection
        }),
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

const AssetWizardDemo = () => {
  const universe = universeDocContext.useDocContext();
  const [now, setNow] = useState(Date.now())

  const file = useAsync(() => universe.backend.clerk.files.service.read({
    gameId: universe.demo.game.id,
    fileId: universe.demo.emptyAssetFile.id
  }), [now])

  if (!file)
    return 'loading';

  const content = file.content;

  const gameC = {
    gameId: universe.demo.game.id,
    artifact: universe.backend.artifact.createService('my-service'),
  }

  if (content.type === 'directory')
    return null;

  const onFileContentUpdate = (content: FileContent) => {
    universe.backend.clerk.files.service.update({
      gameId: file.gameId,
      fileId: file.id
    }, { name: null, content })
    setNow(Date.now());
  }

  return h(ui.AssetWizard, {
    file: { ...file, content },
    universe: universe.backend,
    gameC,
    onFileContentUpdate
  });
}

const SanctumDemo = () => {
  const universe = universeDocContext.useDocContext();

  const gameC = {
    gameId: universe.demo.game.id,
    userId: universe.demo.user.id,
    artifact: universe.backend.artifact.createService('my-service'),
  } as any;

  return h(FramePresenter, { negativeMargin: 256 }, [
    h(OverlayRoot, {}, [
      h(ui.Sanctum, { gameC, universe: universe.backend }),
    ])
  ])
}

const directives = {
  SanctumDemo,
  AssetWizardDemo,
  fileBrowserDemo,
  filesService,
  rootService,
};

export const clerkDocs: DocSheet[] = [
  markdownToSheet("Clerk", readme, directives, null, 'Universe'),
];
