import { OfModelType } from "../Models/model.ts";
import { m } from "./deps.ts";
import { secretDefinition } from "./secret.ts";
import { userDefinition } from "./user.ts";

export type SesameAppID = string;
export type SesameApp = OfModelType<typeof appDefinition>;
export const appDefinition = m.object({
  id: m.string,

  name: m.string,
  owner: userDefinition.properties.id,
  type: m.set(["first-party", "third-party"] as const)
})

export const appSecretDefinition = m.object({
  appId: appDefinition.properties.id,
  secretId: secretDefinition.properties.id
})