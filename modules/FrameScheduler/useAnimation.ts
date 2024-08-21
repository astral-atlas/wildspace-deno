import { useContext, useEffect, Deps } from "@lukekaalim/act";
import { AnimationFrame } from "./FrameScheduler.ts";
import { FrameSchedulerCallback } from "./FrameSchedulerEmitter.ts";
import { frameSchedulerContext, useFrameScheduler } from "./FrameSchedulerContext.ts";

export const useAnimation = (
  key: string,
  onAnimationFrame: FrameSchedulerCallback<AnimationFrame>,
  deps: Deps = []
) => {
  const scheduler = useFrameScheduler();

  useEffect(() => {
    const subscription = scheduler.animation.subscribe(key, onAnimationFrame);
    onAnimationFrame(scheduler.currentFrame);
    return subscription.unsubscribe;
  }, [key, scheduler, ...deps || []]);
};
