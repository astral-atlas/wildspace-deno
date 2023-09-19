import { m } from "./deps.ts";
import { transformDefinition } from "./space.ts";

export const miniDefinitionId = m.meta(m.string, {
  name: 'MiniDefinitionId'
});
export const miniDefinition = m.object({
  id: miniDefinitionId,

  transform: transformDefinition,
})

