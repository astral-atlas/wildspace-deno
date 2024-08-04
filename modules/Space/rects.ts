import { Vector, VectorDimensions } from "./vectors";

export type Rect<D extends VectorDimensions> = {
  dimensions: D,
  position: Vector<D>,
  size: Vector<D>,
};

export const rect2 = (position: Vector<2>, size: Vector<2>): Rect<2> => ({
  dimensions: 2,
  position,
  size,
})
export const rect3 = (position: Vector<3>, size: Vector<3>): Rect<3> => ({
  dimensions: 3,
  position,
  size,
})


export const rectContains = <D extends VectorDimensions>(rect: Rect<D>, point: Vector<D>): boolean => {
  switch (rect.dimensions) {
    case 2:
      const rect2d = rect as Rect<2>;
      const point2d = point as Vector<2>;
      const withinX = point2d.x > rect2d.position.x && point2d.x < rect2d.position.x + rect2d.size.x;
      const withinY = point2d.y > rect2d.position.y && point2d.y < rect2d.position.y + rect2d.size.y;
      return withinX && withinY;
    case 3:
    default:
      throw new Error();
  }
}