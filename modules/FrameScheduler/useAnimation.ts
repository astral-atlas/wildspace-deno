import { useContext, useEffect } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { AnimationFrame } from "./FrameScheduler.ts";
import { FrameSchedulerCallback } from "./FrameSchedulerEmitter.ts";
import { frameSchedulerContext, useFrameScheduler } from "./FrameSchedulerContext.ts";

export const useAnimation = (
  key: string,
  onAnimationFrame: FrameSchedulerCallback<AnimationFrame>,
  deps: unknown[] = []
) => {
  const scheduler = useFrameScheduler();

  useEffect(() => {
    const subscription = scheduler.animation.subscribe(key, onAnimationFrame);
    return subscription.unsubscribe;
  }, [key, scheduler, ...deps]);
};
