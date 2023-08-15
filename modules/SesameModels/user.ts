import { OfModelType } from "../Models/model.ts";

export const userDefinition = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    passwordSecretId: { type: 'string' },
  }
} as const;
export type SesameUser = OfModelType<typeof userDefinition>;
export type SesameUserID = SesameUser["id"];
