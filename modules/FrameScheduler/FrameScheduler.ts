import {
  FrameSchedulerEmitter,
  createFrameSchedulerEmitter,
} from "./FrameSchedulerEmitter.ts";

export type AnimationFrame = {
  deltaMs: number;
  now: number;
};
export type SimulationTick = {
  tickNumber: number;
};

export type FrameScheduler = {
  animation: FrameSchedulerEmitter<AnimationFrame>;
  simulation: FrameSchedulerEmitter<SimulationTick>;
};

export type FrameSchedulerController = {
  readonly options: FrameSchedulerOptions;
  cancel: () => void;
};

export type FrameSchedulerOptions = {
  requestAnimationFrame: typeof requestAnimationFrame;
  cancelAnimationFrame: typeof cancelAnimationFrame;
  setInterval: typeof setInterval;
  clearInterval: typeof clearInterval;

  simulationTimePerTick: number;
};

export const defaultFrameSchedulerOptions: FrameSchedulerOptions = {
  requestAnimationFrame: self.requestAnimationFrame,
  cancelAnimationFrame: self.cancelAnimationFrame,
  setInterval: self.setInterval,
  clearInterval: self.clearInterval,

  simulationTimePerTick: 200,
};

export const createFrameScheduler = (
  options: FrameSchedulerOptions = defaultFrameSchedulerOptions
): [FrameScheduler, FrameSchedulerController] => {
  const {
    requestAnimationFrame,
    cancelAnimationFrame,
    setInterval,
    clearInterval,
    simulationTimePerTick,
  } = options;
  const scheduler: FrameScheduler = {
    animation: createFrameSchedulerEmitter(),
    simulation: createFrameSchedulerEmitter(),
  };

  const animationFrame: AnimationFrame = {
    now: performance.now(),
    deltaMs: 0,
  };
  const onAnimation = (timestamp: DOMHighResTimeStamp) => {
    animationFrame.deltaMs = timestamp - animationFrame.now;
    animationFrame.now = timestamp;
    scheduler.animation.invoke(animationFrame);

    animationHandle = requestAnimationFrame(onAnimation);
  };
  const simulationTick: SimulationTick = {
    tickNumber: 0,
  };
  
  const onSimulation = () => {
    scheduler.simulation.invoke(simulationTick);

    simulationTick.tickNumber++;
  };
  const cancel = () => {
    cancelAnimationFrame(animationHandle);
    clearInterval(intervalHandle);
  };

  const intervalHandle = setInterval(onSimulation, simulationTimePerTick);
  let animationHandle = requestAnimationFrame(onAnimation);

  const controller: FrameSchedulerController = {
    cancel,
    options,
  };

  return [scheduler, controller];
};
