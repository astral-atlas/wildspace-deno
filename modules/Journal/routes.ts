import { JournalBackend } from "./backend.ts";
import { network, simpleSystem } from "./deps.ts";
import { gameSystemDef, gameSystemRESTDef } from "./system.ts";

export const createRoutes = (
  backend: JournalBackend,
): network.http.Route[] => {

  return simpleSystem.createRESTRoutes(
    backend.game,
    gameSystemRESTDef,
  )
};
