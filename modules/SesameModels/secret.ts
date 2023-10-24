import { OfModelType } from "../Models/model.ts";
import { m } from "./deps.ts";

export type SesameSecret = OfModelType<typeof secretDefinition>;
export type SesameSecretID = SesameSecret["id"];

export const secretIdDefinition = m.string;
export const secretDefinition = m.object({
  userId: m.string,
  salt: m.string,

  id: secretIdDefinition,
  value: m.string,
})