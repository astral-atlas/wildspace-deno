import { Component, h, useContext, useEffect, useRef } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { GridSVG } from "./GridSVG.ts";
import { useAnimation } from "../FrameScheduler/useAnimation.ts";
import { Particle2D, ParticleSettings } from "../BoxParticle/particle.ts";
import { Box2, Vector2 } from "https://esm.sh/three";
import { simulateParticle2D } from "../BoxParticle/mod.ts";
import { useSimulation } from "../FrameScheduler/useSimulation.ts";
import { useKeyboardElementRef } from "../Keyboard/useKeyboardElementRef.ts";
import { keyboardStateControllerContext } from "../Keyboard/keyboardStateController.ts";
import { useDraggableSurface } from "./useDraggableSurface.ts";

export type DeskplaneProps = {
  particleSettings: ParticleSettings,
};

const deskplaneParticleSettings: ParticleSettings = {
  dragCoefficent: 0.005,
  velocityMagnitudeMax: 0.5,
  bounds: new Box2(new Vector2(-512, -512), new Vector2(512, 512))
}

export const Deskplane: Component<DeskplaneProps> = ({
  particleSettings = deskplaneParticleSettings,
}) => {
  const elementRef = useRef(null)
  const outputRef = useRef<HTMLPreElement | null>(null);
  const patternRef = useRef<SVGPatternElement | null>(null);
  const particle = useRef<Particle2D>({
    position: new Vector2(),
    velocityPerMs: new Vector2()
  }).current;

  const acceleraton = useRef(new Vector2()).current;
  useKeyboardElementRef(elementRef)
  const keyboard = useContext(keyboardStateControllerContext);

  const { dragging } = useDraggableSurface(elementRef, (diff) => {
    particle.position.add(diff);
    if (particleSettings.bounds) {
      particleSettings.bounds.clampPoint(particle.position, particle.position)
    }
    particle.velocityPerMs.copy(diff);
  })

  useAnimation('Deskplane', ({ deltaMs }) => {
    if (!dragging) {
      simulateParticle2D(particle, particleSettings, acceleraton, deltaMs)
    }

    patternRef.current?.setAttribute('x', particle.position.x.toString());
    patternRef.current?.setAttribute('y', particle.position.y.toString());

    if (outputRef.current)
      outputRef.current.innerText = `
        position:\t${particle.position.x},${particle.position.y}
        velcoity:\t${particle.velocityPerMs.x},${particle.velocityPerMs.y}
        acceleration:\t${acceleraton.x},${acceleraton.y}
      `
  }, [dragging]);
  useSimulation('Deskplane', () => {
    const directions: { [key: string]: Vector2 } = {
      'ArrowUp': new Vector2(0, 1),
      'ArrowDown': new Vector2(0, -1),
      'ArrowLeft': new Vector2(1, 0),
      'ArrowRight': new Vector2(-1, 0),
    };
    acceleraton.copy([...keyboard.keysDown]
      .map(key => directions[key] || new Vector2(0, 0))
      .reduce((acc, curr) => acc.add(curr), new Vector2(0, 0))
      .multiplyScalar(0.002)
    );
  })

  const style = {
    cursor: dragging ? 'grabbing' : null
  };

  return h('div', { tabIndex: 0, ref: elementRef, style }, [
    h(GridSVG, { patternRef }),
    h('pre', { ref: outputRef })
  ]);
};
