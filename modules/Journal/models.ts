import { m } from "./deps.ts";

export const gameIdDefinition = m.meta(m.string, {
  name: 'GameID'
});

export const gameDefinition = m.meta(m.object({
  id: gameIdDefinition,
  name: m.string,
}), { name: 'Game' });
export type Game = m.OfModelType<typeof gameDefinition>;

export const invitationDefinition = m.object({
  id: m.string,
  gameId: m.string,
  inviteeId: m.string,
  role: m.set([
    'observer',
    'player',
    'referee'
  ] as const),
});
