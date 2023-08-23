import { dynamo } from "../deps.ts";

export type TypeOfAttributeValue =
  | string
  | boolean
  | number
  | null
  //| Uint8Array
  | { readonly [key: string]: TypeOfAttributeValue }
  | ReadonlyArray<TypeOfAttributeValue>;

export type TypeOfScalarAttributeValue =
  | string
  | number

export type AttributeRecord = Record<string, dynamo.AttributeValue>;

export const isAttributeValueEqual = (
  a: dynamo.AttributeValue,
  b: dynamo.AttributeValue
) => {
  if (a.S && b.S) return a.S === b.S;
  if (a.N && b.N) return a.N === b.N;
  return false;
};

export const attributeToValue = (
  attribute: dynamo.AttributeValue
): TypeOfAttributeValue => {
  //if (attribute.B !== undefined)
    //return attribute.B;
  if (attribute.BOOL !== undefined)
    return attribute.BOOL;
  if (attribute.S !== undefined)
    return attribute.S;
  if (attribute.N !== undefined)
    return Number.parseFloat(attribute.N);
  if (attribute.M !== undefined)
    return attributeMapToObject(attribute.M);
  if (attribute.L !== undefined)
    return attribute.L.map(attributeToValue);
  if (attribute.NULL !== undefined)
    return null;
  
  return null;
}
export const valueToAttribute = (
  value: TypeOfAttributeValue,
): dynamo.AttributeValue => {
  switch (typeof value) {
    case 'number':
      return { N: value.toString() };
    case 'boolean':
      return { BOOL: value }
    case 'string':
      return { S: value };
    case 'object': {
      if (Array.isArray(value))
        return { L: value.map(valueToAttribute) };
      if (value instanceof Uint8Array)
        return { B: value };
      if (value === null)
        return { NULL: true };
      const map = value as { readonly [key: string]: TypeOfAttributeValue };
      return { M: objectToAttributeMap(map) };
    }
    default:
      return { NULL: true }
  }
}

export const attributeMapToObject = (
  attribute: AttributeRecord
): { readonly [key: string]: TypeOfAttributeValue } => {
  return Object.fromEntries(Object.entries(attribute.M)
    .map(([key, attribute]) => [key, attributeToValue(attribute)])
  );
}
export const objectToAttributeMap = (
  object: { readonly [key: string]: TypeOfAttributeValue }
): AttributeRecord => {
  return Object.fromEntries(Object.entries(object)
    .map(([key, value]) => [key, valueToAttribute(value)])
  );
}