import { m, simpleSystem } from "./deps.ts";
import { gameDefinition } from "./models.ts";

export const gameSystemDef = {
  key: 'Games',
  names: {
    partition: 'gamePart',
    sort: 'gameId',
    resource: 'game'
  },
  models: {
    resource: gameDefinition,
    create: m.object({
      name: m.string,
    }),
    update: m.object({
      name: m.string,
    }),
  }
} as const
export type GameSystem = simpleSystem.TypeOfSimpleSystem<
  typeof gameSystemDef
>;

export const gameSystemRESTDef = simpleSystem.createRESTTransactionDefinitions<GameSystem>(
  gameSystemDef
)