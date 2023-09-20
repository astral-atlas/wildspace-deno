// @ts-nocheck This file does to mean things to the type system.
// best just to trust it's types.
import { Model, ModelOf, ModelsByType, OfModelType } from "./model.ts";

export type Cast<T> = (value: unknown) => T;

export const createModelCaster = <I extends Model>(
  modelDefinition: I,
): Cast<OfModelType<I>> => {
  switch (modelDefinition.type) {
    case "number":
      return castNumber as Cast<OfModelType<I>>;
    case "string":
      return castString as Cast<OfModelType<I>>;
    case "boolean":
      return castBoolean as Cast<OfModelType<I>>;
    case "object":
      return createObjectCaster(
        Object.fromEntries(
          Object.entries(modelDefinition.properties)
            .map(([key, model]) => [key, createModelCaster(model)]),
        ),
      ) as any;
    case "array":
      return createArrayCaster(
        // @ts-ignore j
        createModelCaster(modelDefinition.elements),
      ) as any;
    case 'enum':
      return createEnumCaster(modelDefinition.cases);
    case "union":
      return createUnionCaster(modelDefinition);
    case "literal":
      return createLiteralCaster(modelDefinition)
    case "never":
      return () => {
        throw new Error("Never Caster cannot return");
      };
    default:
      throw new Error("Unknown caster");
  }
};

export const createLiteralCaster = <T>(definition: ModelsByType["literal"]): Cast<T> => {
  const literalCaster = (value: unknown): T => {
    if (value !== definition.value)
      throw new Error();
    return definition.value;
  };
  return literalCaster;
}

export const createUnionCaster = <T>(
  definition: ModelsByType["union"],
): Cast<T> => {
  const caseCasters = Object.fromEntries(
    Object.entries(definition.cases).map(([name, model]) => {
      return [name, createModelCaster(model)];
    }),
  );
  const unionCaster = (value: unknown): T => {
    if (typeof value !== "object" || !value) {
      throw new Error();
    }
    const record = value as Record<string, unknown>;
    const type = castString(record.type);
    const caseCaster = caseCasters[type];
    if (!caseCaster) {
      throw new Error();
    }
    return caseCaster(value);
  };
  return unionCaster;
};

export const castString: Cast<string> = (value) => {
  if (typeof value === "string") return value;
  throw new Error();
};

export const castNumber: Cast<number> = (value) => {
  if (typeof value === "number") return value;
  throw new Error();
};

export const castBoolean: Cast<boolean> = (value) => {
  if (typeof value === "boolean") return value;
  throw new Error();
};

export const createArrayCaster = <T>(
  castElement: Cast<T>,
): Cast<ReadonlyArray<T>> => {
  return (value) => {
    if (!Array.isArray(value)) throw new Error();
    return value.map(castElement);
  };
};
export const createEnumCaster = <T extends string>(
  enums: T[],
): Cast<T> => {
  return (value) => {
    if (!enums.includes(value)) throw new Error();
    return value;
  };
};

export const createObjectCaster = <
  T extends { [key: string]: unknown },
>(casters: { [key in keyof T]: Cast<T[key]> }): Cast<T> => {
  return (value) => {
    if (typeof value !== "object" || value === null) throw new Error();
    const casterEntries = Object.entries(casters);
    const object = value as { [key: string]: unknown };

    return Object.fromEntries(
      casterEntries.map(([key, caster]) => [key, caster(object[key])]),
    ) as T;
  };
};
