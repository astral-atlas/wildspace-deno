export type VectorDimensionStructures = {
  1: { x: number },
  2: { x: number, y: number },
  3: { x: number, y: number, z: number },
  4: { x: number, y: number, z: number, w: number },
}
export type VectorDimensions = (1 | 2 | 3 | 4);
export type VD = VectorDimensions;

export type Vector<D extends VD> = VectorDimensionStructures[D];
export type V<D extends VD> = Vector<D>
export type Vec<D extends VD> = Vector<D>;

declare const mutType: unique symbol;
export type MutableVec<D extends VD> = Vec<D> & { [mutType]: "mutable" };
export type MutVec<D extends VD> = MutableVec<D>;

export const vec2 = (x: number = 0, y: number = 0): Vector<2> => ({ x, y });
export const vec3 = (x: number = 0, y: number = 0, z: number = 0): Vector<3> => ({ x, y, z });

/**
 * Multiply two vectors together
 * @name VectorMultiply
 * @param left 
 * @param right 
 * @returns The multiplied vector
 */
export const vectorMultiply = <T extends Vector<VD>>(left: T, right: T): T => {
  if ('z' in left && 'z' in right)
    return vec3(left.x * right.x, left.y * right.y, left.z * right.z) as T;
  else if ('y' in left && 'y' in right)
    return vec2(left.x * right.x, left.y * right.y) as T;

  throw new Error("Unsupported Vector Size");
}
/**
 * Vector Add
 * 
 * Add each respective component of two vectors together
 */
export const vectorAdd = <T extends Vector<VD>>(left: T, right: T): T => {
  if ('z' in left && 'z' in right)
    return vec3(left.x + right.x, left.y + right.y, left.z + right.z) as T;
  else if ('y' in left && 'y' in right)
    return vec2(left.x + right.x, left.y + right.y) as T;

  throw new Error("Unsupported Vector Size");
}

/**
 * Scalar Multiply
 * 
 * Multiple every component of a vector by a single number
 */
export const vectorScalarMultiply = <T extends Vector<VD>>(left: T, right: number):T => {
  if ('z' in left)
    return vec.new3(left.x * right, left.y * right, left.z * right) as T;
  if ('y' in left)
    return vec.new2(left.x * right, left.y * right) as T;

  throw new Error("Unsupported Vector Size");
}
/**
 * Scalar Add
 * 
 * Add a single number to each component of a vector
 */
export const vectorScalarAdd = <T extends Vector<VD>>(left: T, right: number): T => {
  if ('z' in left)
    return vec.new3(left.x + right, left.y + right, left.z + right) as T;
  if ('y' in left)
    return vec.new2(left.x + right, left.y + right) as T;

  throw new Error("Unsupported Vector Size");
}

/**
 * Vector utility functions
 */
export const vec = {
  new2: vec2,
  new3: vec3,
  a: vectorAdd,
  m: vectorMultiply,
  sm: vectorScalarMultiply,
  sa: vectorScalarAdd,
  zero: { x: 0, y: 0, z: 0, w: 0 },
  one: { x: 1, y: 1, z: 1, w: 1 },
};
