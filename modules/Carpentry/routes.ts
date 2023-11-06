import { Backend } from "./backend.ts";
import { network, simpleSystem } from './deps.ts';
import { roomSystemDef, RoomSystem } from './system.ts';

export const roomTransactions = simpleSystem.createRESTTransactionDefinitions<RoomSystem>(
  roomSystemDef
);

export const createRoomRoutes = (backend: Backend): network.Route[] => {
  const routes = simpleSystem.createRESTRoutes<RoomSystem>(
    backend.room,
    roomTransactions
  );

  return [
    ...routes,
  ];
};
