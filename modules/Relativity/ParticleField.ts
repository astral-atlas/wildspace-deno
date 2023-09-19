import { act, actThree, three, threeCommon } from "./deps.ts";

export type ParticleFieldProps = {
  velocity: three.Vector3,
  position: three.Vector3,
  gravity: three.Vector3,
  size: three.Vector3,
};

export const ParticleField = () => {
  const geometry = threeCommon.useDisposable(() => {
    return new three.BufferGeometry();
  });
  const material = threeCommon.useDisposable(() => {
    return new three.MeshBasicMaterial();
  })

  return act.h('points', { geometry, material });
};