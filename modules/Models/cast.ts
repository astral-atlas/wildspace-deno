import { Model, ModelOf, ModeledType, OfModelType } from "./model.ts";

export type Cast<T> = (value: unknown) => T;

export const createModelCaster = <T extends ModeledType>(
  modelDefinition: ModelOf<T>,
): Cast<T> => {
  switch (modelDefinition.type) {
    case 'number':
      return castNumber as Cast<T>;
    case 'string':
      return castString as Cast<T>;
    case 'boolean':
      return castBoolean as Cast<T>;
    case 'object':
      return createObjectCaster(
        Object.fromEntries(
          Object.entries(modelDefinition)
            .map(([key, model]) => [key, createModelCaster(model)])
        )
      ) as Cast<T>;
    case 'array':
      return createArrayCaster(
        createModelCaster(modelDefinition.elements)
      ) as Cast<T>;
    default:
      throw new Error();
  }
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
  castElement: Cast<T>
): Cast<ReadonlyArray<T>> => {
  return (value) => {
    if (!Array.isArray(value)) throw new Error();
    return value.map(castElement);
  };
};

export const createObjectCaster = <
  T extends { [key: string]: unknown }
>(casters: { [key in keyof T]: Cast<T[key]> }): Cast<T> => {
  return (value) => {
    if (typeof value !== "object" || value === null) throw new Error();
    const casterEntries = Object.entries(casters);
    const object = value as { [key: string]: unknown };

    return Object.fromEntries(
      casterEntries.map(([key, caster]) => [key, caster(object[key])])
    ) as T;
  };
};
