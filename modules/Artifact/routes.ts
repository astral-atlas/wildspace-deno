import { createBlobRoutes } from "./blob/routes.ts";
import { ArtifactService } from "./service.ts";

export const createRoutes = (service: ArtifactService) => {
  return [
    ...createBlobRoutes(service),
  ]
};
