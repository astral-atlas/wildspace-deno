import { Model } from "./model.ts";

export type MetaModel = {
  type: "meta";
  attributes: Record<string, string>;
  value: Model;
};

export const createMetaModel = <T extends Model>(
  value: T,
  attributes: Record<string, string>
) => {
  return {
    type: "meta",
    attributes,
    value,
  } as const;
};

export const meta = createMetaModel;