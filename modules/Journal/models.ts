import { m, sesameModels } from "./deps.ts";

export const gameIdDefinition = m.meta(m.string, {
  name: 'GameID'
});

export const gameDefinition = m.meta(m.object({
  id: gameIdDefinition,
  name: m.string,
}), { name: 'Game' });
export type Game = m.OfModelType<typeof gameDefinition>;

export const invitationDefinition = m.object({
  gameId: m.string,
  inviteeId: m.string,
  role: sesameModels.roleDefinition,
});
export type Invitation = m.OfModelType<typeof invitationDefinition>;