import { h, useEffect, useRef } from "@lukekaalim/act";

import { DocSheet } from "../ComponentDoc/DocElement.ts";
import { simulateParticle2D } from "./mod.ts";
import { Particle2D, ParticleSettings } from "./particle.ts";
import { markdownToDoc, markdownToSheet } from "../ComponentDoc/markdown.ts";

// @deno-types="vite-text"
import readme from './readme.md?raw';
import { three } from "./deps.ts";

const { Box2, Vector2 } = three;

const BoxParticleDemo = () => {
  const outputRef = useRef<HTMLCanvasElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const { current: output } = outputRef;
    const { current: button } = buttonRef;
    if (!output || !button) return;
    const drawing = output.getContext("2d");
    if (!drawing) return;

    const particle: Particle2D = {
      position: new Vector2(128, 128),
      velocityPerMs: new Vector2(0, 0),
    };
    const settings: ParticleSettings = {
      bounds: new Box2(new Vector2(0, 0), new Vector2(256, 256)),
    };
    const startSimulation = () => {
      //particle.position.set(50, 50)
      particle.velocityPerMs.add(
        new Vector2(Math.random() / 4 - 1 / 8, Math.random() / 4 - 1 / 8)
      );
    };
    const id = setInterval(() => {
      simulateParticle2D(particle, settings, new Vector2(0, 0), 50);
      drawing.clearRect(0, 0, 256, 256);

      drawing.fillStyle = "red";
      drawing.fillRect(
        particle.position.x - 5,
        particle.position.y - 5,
        10,
        10
      );
      drawing.beginPath();
      drawing.moveTo(particle.position.x, particle.position.y);
      drawing.strokeStyle = "blue";
      drawing.lineWidth = 2;
      drawing.lineTo(
        particle.position.x + particle.velocityPerMs.x * 50,
        particle.position.y + particle.velocityPerMs.y * 50
      );
      drawing.stroke();
    }, 50);
    button.addEventListener("click", startSimulation);

    startSimulation();

    return () => {
      clearInterval(id);
      button.removeEventListener("click", startSimulation);
    };
  });

  return h("div", {}, [
    h("button", { ref: buttonRef }, "Reload"),
    h("canvas", {
      ref: outputRef,
      width: 256,
      height: 256,
      style: { border: "1px solid black" },
    }),
  ]);
};

export const boxParticleDocs: DocSheet[] = [
  markdownToSheet('Particle', readme, { particle_demo: BoxParticleDemo })
];
