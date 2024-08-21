import { CubicBezierAnimation } from "@lukekaalim/act-curve";
import { curve, nanoid } from "../deps";
import { useArrayChanges } from "./useArrayChanges";

export type ArrayAnimationValueState<T> = {
  id: string,
  key: string,

  value: T,

  index: CubicBezierAnimation,
  flow: CubicBezierAnimation,
  entering: CubicBezierAnimation,
  exiting: CubicBezierAnimation
};

export type ArrayAnimationConfig<T> = {
  calculateKey: (value: T) => string,
  durationMs?: number,
};

export const useArrayAnimation = <T>(values: ReadonlyArray<T>, { calculateKey, durationMs = 500 }: ArrayAnimationConfig<T>) => {
  return useArrayChanges<T, ArrayAnimationValueState<T>>(values, {
    initial: { keys: [], removed: [], current: [], all: [] },
    calculateKey,
    create(key, value, index) {
      const id = nanoid();
      return {
        id,
        key,

        value,

        index: curve.createInitialCubicBezierAnimation(index),
        flow: curve.interpolateCubicBezierAnimation(
          curve.createInitialCubicBezierAnimation(-1),
          0,
          durationMs,
          3,
          performance.now()
        ),
        entering: curve.interpolateCubicBezierAnimation(
          curve.createInitialCubicBezierAnimation(0),
          1,
          durationMs,
          3,
          performance.now()
        ),
        exiting: curve.createInitialCubicBezierAnimation(0),
      }
    },
    move(value, index, oldIndex, state) {
      return {
        ...state,
        value,
        index: curve.interpolateCubicBezierAnimation(
          state.index,
          index,
          durationMs,
          3,
          performance.now()
        )
      }
    },
    persist(value, index, state) {
      return {
        ...state,
        value,
      }
    },
    remove(state) {
      return {
        ...state,
        exiting: curve.interpolateCubicBezierAnimation(
          state.exiting,
          1,
          durationMs,
          3,
          performance.now()
        ),
        flow: curve.interpolateCubicBezierAnimation(
          state.flow,
          1,
          durationMs,
          3,
          performance.now()
        ),
      }
    },
    filter(state) {
      return performance.now() < (state.exiting.span.start + state.exiting.span.durationMs)
    },
  });
};
