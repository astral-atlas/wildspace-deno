export type Model = ModelsByType[keyof ModelsByType];

export type ModeledType =
  | string
  | number
  | boolean
  | null
  | never
  | ReadonlyArray<ModeledType>
  | { readonly [key: string]: ModeledType }

export type TypesByName = {
  'string':   string,
  'number':   number,
  'boolean':  boolean,
  'null':     null,
  'never':    never,
  'any':      any,
  'array':    ReadonlyArray<ModeledType>,
  'object':   { readonly [key: string]: ModeledType }
}

export type ModelsByType = {
  'string':   { type: 'string' },
  'enum':     { type: 'enum', cases: ReadonlyArray<string> },
  'number':   { type: 'number' },
  'boolean':  { type: 'boolean' },
  'null':     { type: 'null' },
  'never':    { type: 'never' },
  'any':      { type: 'any' },
  'literal':  { type: 'literal', value: (string | number | boolean | null) },
  'union':    { type: 'union', cases: { readonly [key: string]: Model } },
  'array':    { type: 'array', elements: Model },
  'object':   { type: 'object', properties: { readonly [key: string]: Model }},
}

export type OfModelType<T extends Model> = {
  "string":   string,
  "number":   number,
  "boolean":  boolean,
  "null":     null,
  "any":      any,
  "never":    never,
  "literal":T extends ModelsByType["literal"] ? T["value"] : never,
  "enum":   T extends ModelsByType["enum"] ? T["cases"][number] : never,
  "union":  T extends ModelsByType["union"] ? OfModelType<T["cases"][keyof T["cases"]]> : never,
  "array":  T extends ModelsByType["array"] ? ReadonlyArray<OfModelType<T["elements"]>> : never,
  "object": T extends ModelsByType["object"] ? { readonly [key in keyof T["properties"]]: OfModelType<T["properties"][key]> } : never,
}[T["type"]]

export const anyModelSymbol = Symbol();
export type AnyModel = typeof anyModelSymbol;

export type ModelOf<T extends TypesByName[keyof TypesByName]> =
  [T] extends [never]   ? ModelsByType["never"] :
  T extends number  ? ModelsByType["number"] :
  T extends string  ? (ModelsByType["string"] | ModelsByType["enum"]) :
  T extends boolean ? ModelsByType["boolean"] :
  T extends null    ? ModelsByType["null"] :
  T extends ModeledType[]         ? { type: 'array', elements: ModelOf<T[number]> } :
  T extends Record<string, infer X> ? { type: 'object', properties: { [key in keyof T]: ModelOf<X> } } :
  T extends typeof anyModelSymbol ? { type: 'any' } :
  any


type a = ModelOf<never>