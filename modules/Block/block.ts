import { m } from "./deps.ts";

export const blockIdDefinition = m.string;
export type BlockID = m.OfModelType<typeof blockIdDefinition>;
export const blockReferenceIdDefinition = m.string;

export const blockReferenceDefinition = m.object({
  id: blockReferenceIdDefinition,
  serviceName: m.string,
});
export type BlockReference = m.OfModelType<typeof blockReferenceDefinition>;

export const blockDetailsDefinition = m.object({
  id: blockIdDefinition,
  status: m.set(['ready', 'uninitialized'] as const),

  byteCount: m.number,
  contentType: m.string,

  references: m.array(blockReferenceDefinition),
})
export type BlockDetails = m.OfModelType<typeof blockDetailsDefinition>;
