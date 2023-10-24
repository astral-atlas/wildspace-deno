import { JournalBackend } from "./backend.ts";
import { network, simpleSystem } from "./deps.ts";
import { gameRESTDef, invitationRESTDef } from "./system.ts";

export const createRoutes = (
  backend: JournalBackend,
): network.http.Route[] => {

  return [
    ...simpleSystem.createRESTRoutes(
      backend.game,
      gameRESTDef,
    ),
    ...simpleSystem.createRESTRoutes(
      backend.invitation,
      invitationRESTDef,
    ),
  ]
};
