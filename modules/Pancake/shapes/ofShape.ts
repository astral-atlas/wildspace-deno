import * as c from './core.ts';
import * as s from './ofType.ts';

import { IsEqual, IsUnion, ShortCircuit } from './utils.ts';

type OfObjectShape<T extends { [key: string]: c.ShapableType }> = {
  type: "object",
  properties: {
    readonly [key in keyof T]: ShortCircuit<
      IsEqual<T[key], c.ShapableType> extends true ? c.AnyShape : never,
      OfShape<T[key]>
    >
  }
}
type OfArrayShape<T extends c.ShapableType[]> = {
  type: 'array',
  element: OfShape<T[number]>
}
type OfUnionShape<T extends c.ShapableType> = {
  type: 'union',
  of: OfShape<T>,
}
type OfLiteralShape<T extends c.SimpleShapeableType> = {
  type: 'literal',
  value: T,
}

type OfSimpleShape<T extends c.SimpleShapeableType> =
  | (IsEqual<T, string> extends true ? c.StringShape : never)
  | (IsEqual<T, number> extends true ? c.NumberShape : never)
  | (IsEqual<T, boolean> extends true ? c.BooleanShape : never)
  | (IsEqual<T, null> extends true ? OfLiteralShape<null> : never)
  | (OfLiteralShape<T>)

/**
 * Given a Type, try to recover the Shape that created
 * it, if any.
 */
type TryReconstructOfType<T> =
  // if T extends s.OfType, someone probably used the OfType function to make this type
  // from a shape. Lets try to infer the original shape!
  T extends s.OfType<infer X> ?
    IsEqual<X, c.AnyShape> extends false ? X : never : 'Not a OfType<X>'

/**
 * Convert a type into a shape!
 * 
 * > Warning: This function can be considered to be _lossy_ in
 * > its information - unless you are converting from a type
 * > generated from "OfType", this code has to "guess" what
 * > kind of properties would be valid.
 * >
 * > > Double warning: actually, this is fucked, don't use
 * > > 
 */
export type OfShape<T extends c.ShapableType> =
  // shortcut:
  // (T extends c.ShapableType) && (c.ShapableType extends T)
  // is only equal when we have no idea what the type is)
  ShortCircuit<
    IsEqual<T, c.ShapableType> extends true ? c.AnyShape : never,
    ShortCircuit<TryReconstructOfType<T>,
      | (T extends c.SimpleShapeableType ? OfSimpleShape<T> : never)
      | (T extends c.ShapableType[] ? OfArrayShape<T> : never)
      | (T extends { readonly [key: string]: c.ShapableType } ? OfObjectShape<T> : never)
    >
  >
  
type A = OfShape<boolean>
type C = OfSimpleShape<boolean>
type B = OfShape<'sweet-home-alabama'>
type D = [
  (IsEqual<boolean, boolean> extends true ? c.BooleanShape : never)
]