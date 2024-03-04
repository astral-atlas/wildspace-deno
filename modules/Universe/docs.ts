import { DocSheet, createDocContext, urlSheet } from "../ComponentDoc/mod.ts";
import { network, simpleSystem } from "./deps.ts";
import { createBackend } from "./mod.ts";

const warlordURL = new URL('./assets/warlord.jpg', import.meta.url);

export const universeDocContext = createDocContext(async () => {
  const world = simpleSystem.createMemoryWorld();
  const internet = network.createMemoryInternet();

  const backend = createBackend(world);
  

  const user = await backend.sesame.service.createUser("lkaalim", "hunter2");
  const session = await backend.sesame.service.createSession(
    user.id,
    "Documentation Website"
  );

  const artifactService = backend.artifact.createService(user.id);

  const game = await backend.journal.game.service.create({ name: "Demo Game" });
  const room = await backend.carpentry.room.service.create({
    name: "Demo Room",
    gameId: game.id,
  });

  const imageBlob = await fetch(warlordURL).then(r => r.blob());

  const imageAsset = await artifactService.uploadAsset(game.id, imageBlob);

  const rootDirectory = await backend.clerk.files.service.create({
    gameId: game.id,
    content: { type: 'directory', children: [] },
    parentId: null,
    name: 'Root Directory',
  })

  const fileRoot = await backend.clerk.roots.service.create({
    gameId: game.id,
    userId: user.id,
    fileId: rootDirectory.id,
  })
  const imageFile = await backend.clerk.files.service.create({
    gameId: game.id,
    content: { type: 'asset', assetId: imageAsset.id },
    parentId: rootDirectory.id,
    name: 'Warlord',
  })
  const emptyAssetFile = await backend.clerk.files.service.create({
    gameId: game.id,
    content: { type: 'asset', assetId: null },
    parentId: rootDirectory.id,
    name: 'Demo Empty Image',
  })
  await backend.clerk.files.service.update({
    gameId: game.id,
    fileId: rootDirectory.id,
  }, {
    content: { type: 'directory', children: [imageFile.id, emptyAssetFile.id] },
    name: null,
  })

  const demo = {
    user,
    session,
    game,
    room,

    imageAsset,
    imageFile,
    emptyAssetFile,
    fileRoot,
  };

  return {
    world,
    internet,
    backend,

    demo,
  };
});

export const universeDocs: DocSheet[] = [
  urlSheet('Universe', new URL('./readme.md', import.meta.url))
]