import {
  network, simpleSystem,
  artifact,
  stage,
  carpentry
} from "./deps.ts";
import {
  GameSystem, InvitationSystem,
  gameSystemDef, invitationSystemDef,
  gameRESTDef, invitationRESTDef,
} from "./system.ts";
import { GameID } from './models.ts';

export type GameController = {
  gameId: GameID,

  artifact: artifact.Service,
  stage: stage.StageService,
  carpentry: carpentry.CarpentryService,
};

export const createGameController = (): GameController => {
  throw new Error();
};
