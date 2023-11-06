import { m, simpleSystem } from "./deps.ts";
import { roomDef, roomContentDef } from "./room.ts";

export const roomSystemDef = {
  key: 'carpentry/room',
  names: {
    partition: 'gameId',
    sort: 'roomId',
    resource: 'room',
  },
  models: {
    resource: roomDef,
    create: m.object({
      name: m.string,
      gameId: m.string,
    }),
    update: m.object({
      name: m.nullable(m.string),
    })
  }
} as const;
export type RoomSystem = simpleSystem.TypeOfSimpleSystem<
  typeof roomSystemDef
>;

export const roomContentSystemDef = {
  key: 'carpentry/room-content',
  names: {
    partition: 'gameId',
    sort: 'roomId',
    resource: 'roomContent',
  },
  models: {
    resource: roomContentDef,
    create: roomContentDef,
    update: m.object({
      type: m.literal('set-scene'),
      nextScene: m.nullable(m.string),
    })
  }
} as const;
export type RoomContentSystem = simpleSystem.TypeOfSimpleSystem<
  typeof roomContentSystemDef
>;