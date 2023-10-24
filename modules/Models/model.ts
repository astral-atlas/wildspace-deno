import { MetaModel } from "./meta.ts";
import { set, array } from "./definitions.ts";
import { createModelCaster } from "./cast.ts";

export type Model = ModelsByType[keyof ModelsByType];

export type ModeledType =
  | string
  | number
  | boolean
  | null
  | ReadonlyArray<ModeledType>
  | { readonly [key: string]: ModeledType }

type StringModel = {
  type: "string"
};
type EnumModel<Cases extends ReadonlyArray<string>> = {
  type: "enum",
  cases: Cases
};
type LiteralModel<Value extends (string | number | boolean | null)> = {
  type: "string",
  value: Value,
};
type ObjectModel<Properties extends Record<string, Model>> = {
  type: 'object',
  properties: Properties
}
type UnionModel<Cases extends ObjectModel<Record<string, Model>>> = {
  type: 'union',
  cases: { [type in Cases["type"]]: Cases["type"] extends type ? Cases : never }
}

export type TypesByName = {
  'string':   string,
  'number':   number,
  'boolean':  boolean,
  'null':     null,
  'never':    never,
  'any':      any,
  'meta':     any,
  'array':    ReadonlyArray<ModeledType>,
  'object':   { readonly [key: string]: ModeledType }
}

export type ModelsByType = {
  'string':   { type: 'string' },
  'enum':     { type: 'enum', cases: ReadonlyArray<string> },
  'number':   { type: 'number' },
  'boolean':  { type: 'boolean' },
  'null':     { type: 'null' },
  'nullable': { type: 'nullable', value: Model },
  'never':    { type: 'never' },
  'any':      { type: 'any' },
  'literal':  { type: 'literal', value: (string | number | boolean | null) },
  'union':    { type: 'union', cases: { readonly [key: string]: Model } },
  'union2':   { type: 'union2', cases: readonly Model[] },
  'array':    { type: 'array', elements: Model },
  'object':   { type: 'object', properties: { readonly [key: string]: Model }},
  'meta':     MetaModel,
}

type OfModelTypeInternal<T extends Model> = {
  "string":   string,
  "number":   number,
  "boolean":  boolean,
  "null":     null,
  "any":      any,
  "never":    never,
  "nullable": T extends ModelsByType["nullable"] ? null | OfModelType<T["value"]> : never,
  "meta":    T extends MetaModel ? OfModelType<T["value"]> : never,
  "literal":T extends ModelsByType["literal"] ? T["value"] : never,
  "enum":   T extends ModelsByType["enum"] ? T["cases"][number] : never,
  "union":  T extends ModelsByType["union"] ? OfModelType<T["cases"][keyof T["cases"]]> : never,
  "union2":  T extends ModelsByType["union2"] ? OfModelType<T["cases"][number]> : never,
  "array":  T extends ModelsByType["array"] ? ReadonlyArray<OfModelType<T["elements"]>> : never,
  "object": T extends ModelsByType["object"] ? { [key in keyof T["properties"]]: OfModelType<T["properties"][key]> } : never,
}[T["type"]]  

export type OfModelType<T extends Model> =
  [Model] extends [T]
    ? ModeledType
    : OfModelTypeInternal<T>

type A = OfModelType<Model>
type B = ModelOf2<A>;

export const anyModelSymbol = Symbol();
export type AnyModel = typeof anyModelSymbol;

export type ModelOf<T extends TypesByName[keyof TypesByName]> =
  [T] extends [never]   ? ModelsByType["never"] :
  T extends number      ? ModelsByType["number"] :
  T extends string      ? (ModelsByType["string"] | ModelsByType["enum"] | { type: 'literal', value: T }) :
  T extends boolean     ? ModelsByType["boolean"] :
  T extends null        ? ModelsByType["null"] | ModelsByType["nullable"] :
  T extends ModeledType[]         ? { type: 'array', elements: ModelOf<T[number]> } :
  T extends Record<string, infer X> ? { type: 'object', properties: { [key in keyof T]: ModelOf<X> } } | { type: 'union', cases: { readonly [key: string]: ModelOf<X> } }:
  T extends typeof anyModelSymbol ? { type: 'any' } :
  any

export type ModelOfPrimitive<T> =
  | (T extends number ?  { type: "number" }  : never)
  | (T extends string ?  ({ type: "string" } | { type: "enum", cases: readonly T[] }) : never)
  | ([T] extends [string] ?  ({ type: "string" } | { type: "enum", cases: readonly T[] }) : never)
  | (T extends boolean ? { type: "boolean" } : never)
  | (T extends null ?    { type: "null" }    : never)
  | (T extends (string | boolean | number | null) ?    { type: "literal", value: T }    : never)

type NullableOption<T> = Exclude<T, null> extends ModeledType ? Exclude<T, null> : never;

type IncludesNull<T> = Extract<T, null> extends never ? false : true;
export type ModelOfNullable<T> =
  | (IncludesNull<T> extends true
      ? { type: 'nullable', value: ModelOf2<NullableOption<T>> }
      : never)

export type ModelOfObject<T> =
  | (T extends Record<string, ModeledType> ?
    { type: 'object', properties: { readonly [key in keyof T]: ModelOf2<T[key]> } }
    : never)
  | (T extends Record<string, ModeledType> ?
    {
      type: 'union',
      cases: {
        readonly [key: string]: {
          type: 'object',
          properties: { readonly [key in keyof T]: ModelOf2<T[key]> }
        }
      }
    }
    : never)

export type ModelOfArray<T extends readonly ModeledType[]> =
  { type: 'array', elements: ModelOf2<T[number]> }

export type ModelOfMeta<T> =
  | T extends ModeledType
    ? { type: 'meta', attributes: Record<string, string>, value: ModelOf2<T> }
    : never;

export type ModelOfUnion2<T extends ModeledType> =
  { type: 'union2', cases: ReadonlyArray<ModelOf2<T>> }

type ModelOf2Internal<T extends ModeledType> = 
  | ModelOfPrimitive<T>
  | ModelOfMeta<T>
  | (T extends readonly ModeledType[] ? ModelOfArray<T> : never)
  | ModelOfObject<T>
  | ModelOfNullable<T>
  | ModelOfUnion2<T>

// ModelOf2<ModeledType> is really expensive (infinite recursion)
// but can more simply be described as Model anyway,
// so we can exit typechecking quickly if thats the case
export type ModelOf2<T extends ModeledType> =
  ([ModeledType] extends [T] ? Model : ModelOf2Internal<T>)
