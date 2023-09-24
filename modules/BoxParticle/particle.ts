import { three } from "./deps.ts";

export type Particle2D = {
  position: three.Vector2;
  velocityPerMs: three.Vector2;
};
export type ParticleSettings = {
  dragCoefficent?: number;
  velocityMagnitudeMax?: number;
  bounds?: null | three.Box2;
};

export const simulateParticle2D = (
  particle: Particle2D,
  {
    velocityMagnitudeMax = 1,
    dragCoefficent = 0.1,
    bounds = null,
  }: ParticleSettings,
  accelerationPerMs: three.Vector2,
  durationMs: number
) => {
  const decay = Math.pow(dragCoefficent, durationMs / 1000);
  const acceleration = accelerationPerMs.clone().multiplyScalar(durationMs);

  particle.velocityPerMs
    .multiplyScalar(decay)
    .add(acceleration)
    .clampLength(0, velocityMagnitudeMax);

  const velocity = particle.velocityPerMs.clone().multiplyScalar(durationMs);

  particle.position.add(velocity);

  if (bounds) bounds.clampPoint(particle.position, particle.position);
};
