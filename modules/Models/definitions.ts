import { createModelCaster } from "./cast.ts";
import { Model, ModelOf, ModelOf2, ModeledType, ModelsByType, OfModelType } from "./model.ts";

export const object = <T extends ModelsByType["object"]["properties"]>(
  properties: T
): { type: "object"; properties: T } => {
  return { type: "object", properties };
};
export const array = <T extends Model>(
  elements: T
): { type: "array"; elements: T } => {
  return { type: "array", elements };
};
export const set = <T extends ReadonlyArray<string>>(
  cases: T
) => {
  return { type: "enum", cases } as const;
};


export const nullable = <T extends Model>(
  value: T
) => {
  return { type: "nullable", value } as const;
};


export const union = <T extends ModelsByType["union"]["cases"]>(cases: T) => {
  return { type: 'union', cases } as const;
};
export const union2 = <T>(cases: T) => {
  return { type: 'union2', cases } as const;
};
export const literal = <T extends ModelsByType["literal"]["value"]>(value: T) => {
  return { type: 'literal', value } as const;
}
export const string =   { type: "string" } as const;
export const number =   { type: "number" } as const;
export const boolean =  { type: "boolean" } as const;
export const any =      { type: "any" } as const;
export const never =    { type: "never" } as const;

export const dynamic = <T>(
  getModel: () => T
) => {
  return { type: 'dynamic', getModel } as const;
}

export const defs = {
  object,
  string,
  number,
  boolean,
  dynamic,
};
