import { useContext, useEffect } from "@lukekaalim/act";
import { SimulationTick } from "./FrameScheduler.ts";
import { FrameSchedulerCallback } from "./FrameSchedulerEmitter.ts";
import { frameSchedulerContext, useFrameScheduler } from "./FrameSchedulerContext.ts";

export const useSimulation = (
  key: string,
  onSimulationTick: FrameSchedulerCallback<SimulationTick>,
  deps: unknown[] = []
) => {
  const scheduler = useFrameScheduler();

  useEffect(() => {
    const subscription = scheduler.simulation.subscribe(key, onSimulationTick);
    onSimulationTick(scheduler.currentTick)
    return subscription.unsubscribe;
  }, [key, scheduler, ...deps]);
};
