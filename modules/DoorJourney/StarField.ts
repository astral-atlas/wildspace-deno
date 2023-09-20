import { schedule } from '../ThreeCommon/deps.ts';
import { act, actThree, three, threeCommon } from './deps.ts';
import { starRoomParticleNames } from './textures/starRoomParticles.ts';
const { h, useRef } = act;

export type StarFieldProps = {
  size: three.Vector3,
}

export const StarField: act.Component<StarFieldProps> = ({ size }) => {
  const ref = useRef<null | three.Group>(null);
  schedule.useAnimation('StarField', (frame) => {
    if (!ref.current)
      return;
    ref.current.rotation.set(0, (-frame.now / 1000) * Math.PI/10, 0);
  });
  const points = useRef(
    Array.from({ length: Math.floor(Math.random() * 5) + 2 })
      .map(() => new three.Vector3(
        (Math.random() * size.x*2) - size.x,
        (Math.random() * size.y*2) - size.y,
        (Math.random() * size.z*2) - size.z))
  ).current;
  const points2 = useRef(
    Array.from({ length: Math.floor(Math.random() * 400) + 100 })
      .map(() => new three.Vector3(
        (Math.random() * size.x*2) - size.x,
        (Math.random() * size.y*2) - size.y,
        (Math.random() * size.z*2) - size.z))
  ).current;

  return h(actThree.group, { ref }, [
    h(StarPoints, { positions: points2 }),
    points.map(position => {
      return h(StarPoint, { position })
    })
  ]);
};

type StarPointProps = {
  position: three.Vector3,
}

const StarPoint: act.Component<StarPointProps> = ({ position }) => {
  const textureName = starRoomParticleNames[Math.floor(Math.random() * starRoomParticleNames.length)];
  const map = threeCommon.useTextureResource(textureName);

  if (!map)
    return null;

  const material = threeCommon.useDisposable(() => {
    return new three.SpriteMaterial({ map })
  })
  return h(actThree.sprite, { position, material, scale: new three.Vector3(10, 10, 10) });
}

type StarPointsProps = {
  positions: three.Vector3[],
}
const StarPoints: act.Component<StarPointsProps> = ({ positions = [] }) => {
  const geometry = threeCommon.useDisposable(() => {
    const geometry = new three.BufferGeometry()
    const vertices = new Float32Array(positions.map(p => [p.x, p.y, p.z]).flat(1));
    geometry.setAttribute( 'position', new three.BufferAttribute( vertices, 3 ) );
    return geometry;
  });
  const material = threeCommon.useDisposable(() => {
    return new three.PointsMaterial({ color: 'white', size: 0.01 });
  });
  return h(actThree.points, {
    geometry,
    material,
  });
}