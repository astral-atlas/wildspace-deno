import { m } from "./deps.ts";

export const boardIdDefinition = m.string;
export const boardDefinition = m.object({
  id: boardIdDefinition,
});
