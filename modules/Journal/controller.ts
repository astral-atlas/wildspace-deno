import {
  network, simpleSystem,
  artifact
} from "./deps.ts";
import {
  GameSystem, InvitationSystem,
  gameSystemDef, invitationSystemDef,
  gameRESTDef, invitationRESTDef,
} from "./system.ts";
import { GameID } from './models.ts';

export type GameController = {
  gameId: GameID,

  artifact: artifact.Service
};

export const createGameController = (): GameController => {
  throw new Error();
};
