import { DocSheet, createDocContext, urlSheet } from "../ComponentDoc/mod.ts";
import { network, simpleSystem } from "./deps.ts";
import { createBackend } from "./mod.ts";

export const universeDocContext = createDocContext(async () => {
  const world = simpleSystem.createMemoryWorld();
  const internet = network.createMemoryInternet();

  const backend = createBackend(world);

  const user = await backend.sesame.service.createUser("lkaalim", "hunter2");
  const session = await backend.sesame.service.createSession(
    user.id,
    "Documentation Website"
  );

  const game = await backend.journal.game.service.create({ name: "Demo Game" });
  const room = await backend.carpentry.room.service.create({
    name: "Demo Room",
    gameId: game.id,
  });

  const demo = {
    user,
    session,
    game,
    room,
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