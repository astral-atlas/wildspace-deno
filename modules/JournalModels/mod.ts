import { m } from "./deps.ts";

export const gameIdDefinition = m.meta(m.string, {
  name: 'GameID'
});

export const gameDefinition = m.object({
  id: gameIdDefinition,
  name: m.string,
});

export const playerRoleDefinition = m.set([
  'observer',
  'player',
  'referee'
] as const)

const castGame = m.createModelCaster(gameDefinition);

const g = castGame('dfas')
g.id

export const gamePlayerInviteDefinition = m.object({
  id: m.string,
  gameId: m.string,
  inviteeId: m.string,
  role: playerRoleDefinition,
});
