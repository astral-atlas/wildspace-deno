import { sesameModels } from "./deps.ts";
import {
  network, simpleSystem,
  artifact,
  stage,
  carpentry
} from "./deps.ts";
import { GameID } from './models.ts';

export type GameController = {
  gameId: GameID,
  userId: sesameModels.SesameUserID,

  artifact: artifact.Service,
  stage: stage.StageService,
  carpentry: carpentry.CarpentryService,
};

export const createGameController = (): GameController => {
  throw new Error();
};
