import { StageChannelType } from "./channel.ts";
import { channel } from "./deps.ts";

export type StageService = {
  connect: () => Promise<channel.Channel<StageChannelType>>,
};

export const createBackendStageService = () => {

};

export const createRemoteStageService = () => {

};
