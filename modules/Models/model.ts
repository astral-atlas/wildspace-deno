export type Model = ModelsByType[keyof ModelsByType];

export type ModeledType =
  | string
  | number
  | boolean
  | null
  | ReadonlyArray<ModeledType>
  | { readonly [key: string]: ModeledType }

export type TypesByName = {
  'string':   string,
  'number':   number,
  'boolean':  boolean,
  'null':     null,
  'union':    ReadonlyArray<ModeledType>,
  'array':    ReadonlyArray<ModeledType>,
  'object':   { readonly [key: string]: ModeledType }
}

export type ModelsByType = {
  'string':   { type: 'string' },
  'number':   { type: 'number' },
  'boolean':  { type: 'boolean' },
  'null':     { type: 'null' },
  'union':    { type: 'union', elements: ReadonlyArray<Model> },
  'array':    { type: 'array', elements: Model },
  'object':   { type: 'object', properties: { readonly [key: string]: Model }},
}

export type OfModelType<T extends Model> = {
  "string": string,
  "number": number,
  "boolean": boolean,
  "null": null,
  "union":  T extends ModelsByType["union"] ? OfModelType<T["elements"][number]> : never,
  "array":  T extends ModelsByType["array"] ? ReadonlyArray<OfModelType<T["elements"]>> : never,
  "object": T extends ModelsByType["object"] ? { readonly [key in keyof T["properties"]]: OfModelType<T["properties"][key]> } : never,
}[T["type"]]


export type ModelOf<T extends TypesByName[keyof TypesByName]> =
  T extends number  ? ModelsByType["number"] :
  T extends string  ? ModelsByType["string"] :
  T extends boolean ? ModelsByType["boolean"] :
  T extends null    ? ModelsByType["null"] :
  T extends ModeledType[]         ? { type: 'array', elements: ModelOf<T[number]> } :
  T extends TypesByName["object"] ? { type: 'object', properties: { readonly [key in keyof T]: ModelOf<T[key]> } } :
  any
