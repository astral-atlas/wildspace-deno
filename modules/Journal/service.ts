import { network, simpleSystem } from "./deps.ts";
import {
  GameSystem, InvitationSystem,
  gameSystemDef, invitationSystemDef,
  gameRESTDef, invitationRESTDef,
} from "./system.ts";

export type JournalService = {
  game: simpleSystem.Service<GameSystem>,
  invitation: simpleSystem.Service<InvitationSystem>,
}

export const createRemoteJournalService = (
  domain: network.DomainClient,
): JournalService => {
  const game = simpleSystem.createRESTClient(domain, gameRESTDef);
  const invitation = simpleSystem.createRESTClient(domain, invitationRESTDef);
  
  return { game, invitation };
}