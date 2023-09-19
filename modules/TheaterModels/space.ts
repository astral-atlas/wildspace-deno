import { m } from "./deps.ts";

export const vectorDefinition = m.object({
  x: m.number,
  y: m.number,
  z: m.number,
})
export const quaternionDefinition = m.object({
  x: m.number,
  y: m.number,
  z: m.number,
  w: m.number,
})

export const transformDefinition = m.object({
  position: vectorDefinition,
  rotation: quaternionDefinition,
  scale: vectorDefinition,
});