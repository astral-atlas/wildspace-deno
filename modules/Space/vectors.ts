export type VectorDimensionStructures = {
  1: { x: number },
  2: { x: number, y: number },
  3: { x: number, y: number, z: number }
}
export type VectorDimensions = (1 | 2 | 3);

export type Vector<Dimension extends VectorDimensions> = VectorDimensionStructures[Dimension];
export type V<D extends VectorDimensions> = Vector<D>

export const vec2 = (x: number = 0, y: number = 0): Vector<2> => ({ x, y });
export const vec3 = (x: number = 0, y: number = 0, z: number = 0): Vector<3> => ({ x, y, z });