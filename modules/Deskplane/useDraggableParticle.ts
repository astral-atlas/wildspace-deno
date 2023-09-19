import {
Ref,
  useContext,
  useRef,
} from "https://esm.sh/@lukekaalim/act@2.6.0";
import { useAnimation } from "../FrameScheduler/useAnimation.ts";
import { Particle2D, ParticleSettings } from "../BoxParticle/particle.ts";
import { Box2, Vector2 } from "https://esm.sh/three@0.155.0";
import { simulateParticle2D } from "../BoxParticle/mod.ts";
import { useSimulation } from "../FrameScheduler/useSimulation.ts";
import { useKeyboardElementRef } from "../Keyboard/useKeyboardElementRef.ts";
import { keyboardStateControllerContext } from "../Keyboard/keyboardStateController.ts";
import { useDraggableSurface } from "./useDraggableSurface.ts";
import { AnimationFrame } from "../FrameScheduler/FrameScheduler.ts";


const deskplaneParticleSettings: ParticleSettings = {
  dragCoefficent: 0.005,
  velocityMagnitudeMax: 0.5,
  bounds: new Box2(new Vector2(-512, -512), new Vector2(512, 512)),
};

export type DraggableParticle = {
  particle: Particle2D,
  dragging: Element | null,
}

export const useDraggableParticle = (
  surfaceRef: Ref<null | HTMLElement>,
  particleSettings: ParticleSettings = deskplaneParticleSettings,
  updateParticle: (particle: Particle2D, frame: AnimationFrame) => unknown,
  enabled: boolean = true,
): DraggableParticle => {
  const particle = useRef<Particle2D>({
    position: new Vector2(),
    velocityPerMs: new Vector2(),
  }).current;

  const acceleraton = useRef(new Vector2()).current;
  useKeyboardElementRef(surfaceRef);
  const keyboard = useContext(keyboardStateControllerContext);

  const { dragging } = useDraggableSurface(surfaceRef, (diff) => {
    if (!enabled)
      return;
    particle.position.add(diff);
    if (particleSettings.bounds) {
      particleSettings.bounds.clampPoint(particle.position, particle.position);
    }
    particle.velocityPerMs.copy(diff);
  });

  useAnimation("Deskplane", (frame) => {
      if (!dragging) {
        simulateParticle2D(particle, particleSettings, acceleraton, frame.deltaMs);
      }

      updateParticle(particle, frame);
    },
    [dragging]
  );

  useSimulation("Deskplane", () => {
    const directions: { [key: string]: Vector2 } = {
      ArrowUp: new Vector2(0, 1),
      ArrowDown: new Vector2(0, -1),
      ArrowLeft: new Vector2(1, 0),
      ArrowRight: new Vector2(-1, 0),
    };
    acceleraton.copy(
      [...keyboard.keysDown]
        .map((key) => directions[key] || new Vector2(0, 0))
        .reduce((acc, curr) => acc.add(curr), new Vector2(0, 0))
        .multiplyScalar(0.002)
    );
  }, [dragging]);

  return { particle, dragging }
};