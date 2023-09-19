import { blockIdDefinition } from "../Block/mod.ts";
import { m } from "./deps.ts";
import { vectorDefinition } from "./space.ts";

export const costumeDefinition = m.union({
  sprite: m.object({
    type: m.literal("sprite"),
    size: vectorDefinition,
    texture: blockIdDefinition,
  }),
});
