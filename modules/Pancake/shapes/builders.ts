import { AnyShape, AnySimpleShape, LiteralShape, ShapableType, SimpleShapeableType, StringShape } from "./core";
import { OfShape } from "./ofShape";

/**
 * Primitive/Simple shape.
 * 
 * @param type The type that this shape represents - "string", "boolean" or "number"
 */
export const simple = <T extends AnySimpleShape["type"]>(type: T) => ({
  type
}) as const;
/**
 * Literal shape
 * 
 * @param value The specific value this is valid for this shape
 */
export const literal = <T extends SimpleShapeableType>(value: T) => ({
  type: 'literal',
  value,
}) as const;
/**
 * Array shape
 * 
 * @param element The shape of all the elements of the array.
 */
export const array = <T extends ShapableType>(element: OfShape<T>) => ({
  type: 'array',
  element,
}) as const;
/**
 * Object shape
 * 
 * @param properties - The key/values for each valid property on the object.
 */
export const object = <T extends { readonly [key: string]: AnyShape }>(properties: T) => ({
  type: 'object',
  properties,
}) as const
/**
 * @param of The different values that this shape may be.
 */
export const union = <T extends ReadonlyArray<AnyShape>>(of: T) => ({
  type: 'union',
  of,
}) as const

/**
 * Quick names for referencing functions that build shapes
 */
export const shape = {
  bool: simple('boolean'),
  num: simple('number'),
  str: simple('string'),

  l: literal,
  a: array,
  o: object,
  u: union,

  literal,
  array,
  object,
  union,
}
export const s = shape;