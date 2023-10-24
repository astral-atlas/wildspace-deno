import { sesameModels } from "../Sesame/deps.ts";
import { m, simpleSystem } from "./deps.ts";
import { gameDefinition, invitationDefinition } from "./models.ts";

export const gameSystemDef = {
  key: 'games',
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

export const gameRESTDef = simpleSystem.createRESTTransactionDefinitions<GameSystem>(
  gameSystemDef
)

export const invitationSystemDef = {
  key: 'invitations',
  names: {
    partition: 'gamePart',
    sort: 'gameId',
    resource: 'invitation'
  },
  models: {
    resource: invitationDefinition,
    create: m.object({
      gameId: m.string,
      role: sesameModels.roleDefinition,
      inviteeId: m.string,
    }),
    update: m.literal(null)
  }
}
export type InvitationSystem = simpleSystem.TypeOfSimpleSystem<
  typeof invitationSystemDef
>;

export const invitationRESTDef = simpleSystem.createRESTTransactionDefinitions<InvitationSystem>(
  invitationSystemDef
)