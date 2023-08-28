// @ts-nocheck This file does to mean things to the type system.
// best just to trust it's types.
import { Model, OfModelType } from "./model.ts";

export type Cast<T> = (value: unknown) => T;

export const createModelCaster = <I extends Model>(
  modelDefinition: I,
): Cast<OfModelType<I>> => {
  switch (modelDefinition.type) {
    case 'number':
      return castNumber as Cast<OfModelType<I>>;
    case 'string':
      return castString as Cast<OfModelType<I>>;
    case 'boolean':
      return castBoolean as Cast<OfModelType<I>>;
    case 'object':
      return createObjectCaster(
        Object.fromEntries(
          Object.entries(modelDefinition.properties)
            .map(([key, model]) => [key, createModelCaster(model)])
        )
      ) as any;
    case 'array':
      return createArrayCaster(
        // @ts-ignore j
        createModelCaster(modelDefinition.elements)
      ) as any;
    case 'literal':
    case 'enum':
    case 'union':
      throw new Error('Unimplemented caster')
    case 'never':
      return () => { throw new Error('Never Caster cannot return'); }
    default:
      throw new Error('Unknown caster');
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
