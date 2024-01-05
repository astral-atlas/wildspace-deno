import { simpleSystem, network } from "./deps.ts";
import { roomSystemDef, RoomSystem } from "./system.ts";

export type CarpentryService = {
  rooms: simpleSystem.Service<RoomSystem>;
};

export const createRemoteCarpentryService = (domain: network.DomainClient): CarpentryService => {
  const rooms = simpleSystem.createRemoteService<RoomSystem>(
    domain,
    simpleSystem.createRESTTransactionDefinitions(roomSystemDef)
  );
  
  return {
    rooms,
  }
};
