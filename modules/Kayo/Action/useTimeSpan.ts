import { act, curve, schedule } from "../deps"

const timeoutOrImmediate = () => {

}

export const mergeTimeSpans = (left: curve.TimeSpan, right: curve.TimeSpan) => {
  const start = Math.min(left.start, right.start);
  const end = Math.max(left.start + left.durationMs, right.start + right.durationMs);
  const durationMs = end - start;
  return { start, durationMs };
}

export const useTimeSpan = (
  key: string,
  span: curve.TimeSpan,
  onSpanFrame: schedule.FrameSchedulerCallback<schedule.AnimationFrame & { progress: number, span: curve.TimeSpan }>,
  deps: act.Deps = []
) => {
  const scheduler = schedule.useFrameScheduler();

  act.useEffect(() => {
    const now = performance.now();
    const msToStart = span.start - now;
    const msToEnd = span.start + span.durationMs - now;

    let state: 'not-started' | 'running' | 'finished' = 'not-started';

    let subscription: schedule.FrameSchedulerSubscription<schedule.AnimationFrame> | null = null;

    const onFrame = (frame: schedule.AnimationFrame) => {
      const progress = Math.min(1, Math.max(0, (frame.now - span.start) / span.durationMs));
      onSpanFrame({ ...frame, progress, span });
    }

    const startTimeout = setTimeout(() => {
      if (state === 'not-started') {
        subscription = scheduler.animation.subscribe(key, onFrame);
        state = 'running';
      }
    }, msToStart)
    const endTimeout = setTimeout(() => {
      if (state === 'running' && subscription) {
        subscription.unsubscribe();
        subscription = null;
        state = 'finished';
      }
    }, msToEnd)

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(endTimeout);
      if (subscription)
        subscription.unsubscribe();
    }
  }, [key, scheduler, span, ...deps || []]);
}