import { network, simpleSystem } from "./deps.ts";
import { SlideSystem, slideRESTDef } from "./system.ts";

export type PresentationService = {
  slide: simpleSystem.Service<SlideSystem>,
}

export const createRemoteService = (
  domain: network.DomainClient
): PresentationService => {
  const slide = simpleSystem.createRemoteService(domain, slideRESTDef);
  return { slide };
}