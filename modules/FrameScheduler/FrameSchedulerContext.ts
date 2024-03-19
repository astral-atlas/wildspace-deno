import {
  Component,
  h,
  createContext,
  useMemo,
  useContext,
} from "@lukekaalim/act";
import {
  FrameScheduler,
  FrameSchedulerOptions,
  createFrameScheduler,
} from "./FrameScheduler.ts";

export const frameSchedulerContext = createContext<FrameScheduler | null>(null);

export const FrameSchedulerProvider: Component<{
  options: FrameSchedulerOptions;
}> = ({ children, options }) => {
  const [scheduler] = useMemo(() => {
    return createFrameScheduler(options);
  }, [
    options.cancelAnimationFrame,
    options.requestAnimationFrame,
    options.clearInterval,
    options.setInterval,
    options.simulationTimePerTick,
  ]);

  return h(frameSchedulerContext.Provider, { value: scheduler }, children);
};

export const useFrameScheduler = (): FrameScheduler => {
  const frame = useContext(frameSchedulerContext);
  if (!frame)
    throw new Error(`No frame scheduler in context`);
  return frame;
};
