import { OfModelType } from "../Models/model.ts";
import { appDefinition } from "./app.ts";
import { m } from "./deps.ts";
import { SesameUserID, userDefinition } from "./user.ts";

export type Actor = OfModelType<typeof actorDefinition>;

export const actorDefinition = m.union({
  'user': m.object({
    type: m.literal('user'),
    userId: userDefinition.properties.id,
  }),
  'admin': m.object({
    type: m.literal('admin'),
    userId: userDefinition.properties.id,
  }),
  'guest': m.object({
    type: m.literal('guest'),
  }),
  'application': m.object({
    type: m.literal('application'),
    appId: appDefinition.properties.id
  }),
})

export type Role = OfModelType<typeof roleDefinition>;

export const roleDefinition = m.set([
  'user',
  'admin',
  'guest',
  'application'
] as const)
