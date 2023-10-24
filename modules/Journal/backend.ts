import { nanoid, simpleSystem } from "./deps.ts";
import { GameSystem, gameSystemDef } from "./system.ts";

export type JournalBackend = {
  game: simpleSystem.Components<GameSystem>,
}

export const createJournalBackend = (world: simpleSystem.World): JournalBackend => {
  const game = simpleSystem.createComponents<GameSystem>(world, {
    definition: gameSystemDef,
    service: {
      create({ name }) {
        return {
          id: nanoid(),
          name
        }
      },
      update(game, { name }) {
        return { ...game, name };
      },
      calculateKey(game) {
        return {
          part: 'all',
          sort: game.id,
        }
      }
    }
  })
  return { game };
}