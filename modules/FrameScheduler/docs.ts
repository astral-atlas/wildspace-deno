import { DocSheet } from "../ComponentDoc/DocElement.ts";
import { useState } from "@lukekaalim/act";
import { useRef } from "@lukekaalim/act";
import { createFrameScheduler } from "./FrameScheduler.ts";
import { useEffect } from "@lukekaalim/act";
import { h } from "@lukekaalim/act";

// @deno-types="vite-text"
import readme from './readme.md?raw';
import { markdownToSheet } from "../ComponentDoc/markdown.ts";

export const FrameSchedulerDemo = () => {
  const [scheduler, controller] = useRef(createFrameScheduler()).current;

  const animationRef = useRef<HTMLDivElement | null>(null);
  const simulationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const { current: animationDiv } = animationRef;
    const { current: simulationDiv } = simulationRef;
    if (!animationDiv || !simulationDiv) return;

    const animationSubscription = scheduler.animation.subscribe(
      "ANIM_DEMO",
      (e) => {
        animationDiv.style.backgroundColor = `hsl(${
          Math.floor((e.now * 40) / 1000) % 360
        }deg, 70%, 80%)`;
        animationDiv.innerText = `now: ${e.now}\ndeltaMs: ${
          e.deltaMs
        }\nfps: ${Math.round(1000 / e.deltaMs)}`;
      }
    );
    const simulationSubscription = scheduler.simulation.subscribe(
      "SIM_DEMO",
      (e) => {
        simulationDiv.style.backgroundColor = `hsl(${
          (e.tickNumber * 8) % 360
        }deg, 70%, 80%)`;
        simulationDiv.innerText = `tickNumber: ${e.tickNumber.toString()}\ntickInterval: ${controller.options.simulationTimePerTick}\ntps: ${1000/controller.options.simulationTimePerTick}`;
      }
    );
    return () => {
      animationSubscription.unsubscribe();
      simulationSubscription.unsubscribe();
    };
  }, [scheduler, controller]);

  return h("div", { style: { display: "flex" } }, [
    h(
      "pre",
      { ref: animationRef, style: { padding: "4px", flex: 1 } },
      " "
    ),
    h(
      "pre",
      { ref: simulationRef, style: { padding: "4px", flex: 1 } },
      " "
    ),
  ]);
};

export const frameSchedulerDocs: DocSheet[] = [
  markdownToSheet('FrameScheduler', readme)
];
