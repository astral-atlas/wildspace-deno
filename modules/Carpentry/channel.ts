import { channel, rxjs, sesame, m, journal } from "./deps.ts";
import {
  createAuthenticatedChannel,
  createAuthenticatedChannelDef,
  createGatewayChannel,
  gatewayChannelDef,
  GatewayChannelType,
} from "./channels/mod.ts";
import { Backend } from "./backend.ts";
import { RoomID } from "./room.ts";

export const carpentryChannelDef =
  createAuthenticatedChannelDef<GatewayChannelType>(gatewayChannelDef);

export const createCarpentryChannel = (
  backend: Backend,
  sesameBackend: sesame.SesameBackend,
  gameId: journal.GameID,
  roomId: RoomID
) => {
  return createAuthenticatedChannel<GatewayChannelType>(
    gatewayChannelDef,
    sesameBackend,
    (user) => {
      const gateway = createGatewayChannel(backend, gameId, roomId, user);
      //const channel = gateway.connect();
      return gateway;
    }
  );
};
