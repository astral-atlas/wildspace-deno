import { m } from "./deps.ts";

export const terrainIdDefinition = m.string;
export const terrainDefinition = m.object({
  id: terrainIdDefinition,
})

