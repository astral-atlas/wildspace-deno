import { createBlobRoutes } from "./blob/routes.ts";
import { BlobStreamService } from "./blob/service.ts";

export const createRoutes = (service: BlobStreamService) => {
  return [
    ...createBlobRoutes(service),
  ]
};
