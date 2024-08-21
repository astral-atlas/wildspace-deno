import { test, describe } from "node:test";
import { strictEqual } from "node:assert";

import { rect2, rect2WithinRect } from "./rects";
import { vec2 } from "./vectors";

describe('space.rects', () => {
  describe('rect2WithinRect()', () => {
    test('it should return true for a rect fully within another', () => {
      const outer = rect2(vec2(0, 0), vec2(10, 10));
      const inner = rect2(vec2(2, 2), vec2(2, 2));

      strictEqual(rect2WithinRect(outer, inner), true);
    })
  })
});