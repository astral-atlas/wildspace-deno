import { models } from "./deps.ts";

export type IdentitySesameService = {
  createRoleFromIdentityRequest(
    request: models.IdentityRequest
  ): Promise<models.SesameRole>;
  createRoleFrom(
    request: models.IdentityRequest
  ): Promise<models.SesameRole>;
};
