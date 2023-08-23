import { OfModelType } from "../Models/model.ts";
import { m } from "./deps.ts";
import { secretIdDefinition } from "./secret.ts";
import { userDefinition } from "./user.ts";

export const sessionDefinition = m.object({
  id: m.string,
  userId: userDefinition.properties.id,

  startTime: m.number,
  secretId: secretIdDefinition,
})
export type SesameSession = OfModelType<typeof sessionDefinition>;