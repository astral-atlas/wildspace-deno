import { m } from "./deps.ts";
import { roomResourceDef, roomContentDef } from './room.ts';

export const clientProtocolDef = m.union2([
  
]);

export type ClientProtocol = m.OfModelType<typeof clientProtocolDef>;

export const serverProtocolDef = m.union2([
  m.object({
    type: m.literal('room-content-set'),
    content: roomContentDef,
  }),
  m.object({
    type: m.literal('resource-set'),
    key: m.string,
    resource: roomResourceDef,
  }),
  m.object({
    type: m.literal('resource-delete'),
    key: m.string,
  }),
]);

export type ServerProtocol = m.OfModelType<typeof serverProtocolDef>;