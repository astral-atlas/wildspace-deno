// Simple Shapes
export type StringShape = {
  type: 'string'
}
export type NumberShape = {
  type: 'number'
}
export type BooleanShape = {
  type: 'boolean'
}

export type AnySimpleShape = 
  | StringShape
  | NumberShape
  | BooleanShape

// Compound Shapes
export type ObjectShape = {
  type: 'object',
  properties: { readonly [key: string]: AnyShape },
}
export type ArrayShape = {
  type: 'array',
  element: AnyShape,
}
export type LiteralShape = {
  type: 'literal',
  value: SimpleShapeableType
}
export type TupleShape = {
  type: 'tuple',
  elements: ReadonlyArray<AnyShape>
}

export type AnyCompoundShape = 
  | ObjectShape
  | ArrayShape
  | LiteralShape
  | TupleShape

// Complex Shapes
export type UnionShape = {
  type: 'union',
  of: ReadonlyArray<AnyShape>
}

export type AnyComplexShape =
  | UnionShape

/**
 * Any kind of shape.
 * 
 * > This type should really only be used
 * > by functions that operate on _nonspecific_
 * > shapes (like a generic function that
 * > serialized a shape).
 * > 
 * > Regular users should use concrete
 * > implementations of shapes - like the ones
 * > created by the `def()` function!
 */
export type AnyShape =
  | AnySimpleShape
  | AnyCompoundShape
  | AnyComplexShape

export type SimpleShapeableType =
  | string
  | number
  | boolean
  | null

export type CompoundShapableType =
  | { readonly [key: string]: ShapableType }
  | ReadonlyArray<ShapableType>

/**
 * Any kind of type that could be represented by a
 * shape.
 * 
 * > Much like "AnyShape", you should be using concrete
 * > types in most day-to-day functions - this type
 * > is typically used for functions that operate on
 * > the generic results of shapes, or as an `extends` requirement
 * > to make sure the type that is being passed _can_ be converted
 * > to a shape.
 */
export type ShapableType =
  | SimpleShapeableType
  | CompoundShapableType

/**
 * Define a Shape.
 * 
 * This function does nothing, but will throw a type
 * error if the provided object is not a shape - helping
 * your find type errors earlier on rather than later
 * when using the shape.
 */
export const def = <T extends AnyShape>(input: T): T => input;
