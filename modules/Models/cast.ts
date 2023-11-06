// @ts-nocheck This file does to mean things to the type system.
// best just to trust it's types.
import { Model, ModelOf, ModeledType, ModelsByType, OfModelType } from "./model.ts";

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
    case 'meta':
      return createModelCaster(modelDefinition.value);
    case 'enum':
      return createEnumCaster(modelDefinition.cases);
    case 'nullable':
      return createNullableCaster(createModelCaster(modelDefinition.value));
    case "union":
      return createUnionCaster(modelDefinition);
    case 'union2':
      return createUnion2Caster(modelDefinition);
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
      throw new Error(`"${value}" is not literally "${definition.value}"`);
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

export const createUnion2Caster = <T>(
  definition: ModelsByType["union2"],
) => {
  const casters = definition.cases.map(createModelCaster);
  const unionCaster = (value: unknown): T => {
    for (const caster of casters) {
      try {
        return caster(value)
      } catch {
        // failed to cast
      }
    }
    throw new Error(`No matching caster`);
  };
  return unionCaster;
}

export const castString: Cast<string> = (value) => {
  if (typeof value === "string") return value;
  throw new Error(`${value} is not a string`);
};

export const castNumber: Cast<number> = (value) => {
  if (typeof value === "number") return value;
  throw new Error(`${value} is not a number`);
};

export const castBoolean: Cast<boolean> = (value) => {
  if (typeof value === "boolean") return value;
  throw new Error(`${value} is not a boolean`);
};

export const createNullableCaster = <T>(
  castValue: Cast<T>
): Cast<T | null> => {
  return (value) => {
    if (value === null)
      return null;
    return castValue(value);
  }
}

export const createArrayCaster = <T>(
  castElement: Cast<T>,
): Cast<ReadonlyArray<T>> => {
  return (value) => {
    if (!Array.isArray(value)) throw new Error();
    return value.map(castElement);
  };
};
export const createEnumCaster = <T extends string>(
  enums: readonly T[],
): Cast<T> => {
  return (value) => {
    if (!enums.includes(value)) throw new Error();
    return value;
  };
};

export const createObjectCaster = <
  T extends { [key: string]: unknown },
>(casters: { [key in keyof T]: Cast<T[key]> }): Cast<T> => {
  const casterEntries = Object.entries(casters);
  return (value) => {
    const object = castObject(value);
    
    return Object.fromEntries(
      casterEntries.map(([key, caster]) => {
        try {
          return [key, caster(object[key])]
        } catch (error) {
          throw new Error(`Object property "${key}" is invalid:\n${error.message}`, { cause: error });
        }
      }),
    ) as T;
  };
};

export const castObject: Cast<Record<string, ModeledType>> = (value) => {
  if (typeof value !== "object" || value === null)
    throw new Error();
  
  return value;
}