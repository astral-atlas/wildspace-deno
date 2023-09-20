import { useEffect, useRef, useState } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { atlasRenderer, threeCommon, effectsCommon, three } from "./deps.ts";
import { useAnimation } from "../../modules/FrameScheduler/useAnimation.ts";
import { MeshBasicMaterial } from "https://esm.sh/three@0.155.0";
import { useGeometryResource, useTextureResource } from "../../modules/ThreeCommon/ResourceSet.ts";

const {
  actThree,
  act: { h },
} = atlasRenderer;

export const SesamePage = () => {
  const cameraRef = useRef<three.PerspectiveCamera | null>(null);

  return h("div", { style: { display: "flex", flex: 1, overflow: 'hidden' } }, [
    h(effectsCommon.EffectResourcesProvider, {},
      h(threeCommon.SimpleCanvas, { overrides: { cameraRef }, sceneProps: { background: new three.Color('grey') } }, [
        h(effectsCommon.LoopingTrack, {
          renderContent() {
            return h(RandomGlyphField);
          },
          size: 50,
          count: 8,
          period: 6000,
        }),
        h(actThree.perspectiveCamera, {
          ref: cameraRef,
          rotation: new three.Euler(0, Math.PI / 2, 0),
        }),
      ]),
    ),
  ]);
};

const RandomGlyphField = () => {
  const [count] = useState(Math.floor(Math.random() * 20));
  const ref = useRef<three.Group | null>(null);

  const floorMesh = useGeometryResource('FloorPlane')

  return h(actThree.group, { ref }, [
    Array.from({ length: count + 10 }).map(() => h(RandomGlyph)),
    floorMesh && h(Floor, { floorMesh })
  ])
};

const Floor = ({ floorMesh }) => {
  const concreteTexture = useTextureResource('concrete')
  const [spawnTime] = useState(performance.now());
  const material = threeCommon.useDisposable(
    () => new MeshBasicMaterial()
  );
  const pillarGeo = useGeometryResource('Pillar')
  useEffect(() => {
    if (!concreteTexture)
      return;
    material.map = concreteTexture;
    material.color = new three.Color('black')
    material.side = three.DoubleSide;
  }, [material, concreteTexture])
  const [targetColor] = useState(new three.Color(`hsl(0, 0%, ${(Math.random() * 20) + 80}%)`))

  useAnimation("FloorFade", (frame) => {
    const lifeTime = frame.now - spawnTime;
    material.color.lerp(targetColor, lifeTime / 8000);
  });
  const [count] = useState(Math.floor(Math.random() * 5));
  
  return [
    pillarGeo && Array.from({ length: count }).map(() => h(Pillar, { geometry: pillarGeo, material })),
    h(actThree.mesh, {
      geometry: floorMesh,
      material,
      scale: new three.Vector3(2.5, 20, 2.5),
      position: new three.Vector3(0, -3, -0),
      rotation: new three.Euler(Math.PI / 2, 0, 0),
    })
  ]
}

export const Pillar = ({ geometry, material }) => {
  const [position] = useState(
    new three.Vector3(
      (Math.random() * 50) - 25,
      -2,
      (Math.random() * 200) - 100,
    )
  );
  const [rotation] = useState(
    new three.Euler(
      -Math.PI / 2,
      (Math.random() * Math.PI) / 100,
      Math.random() * Math.PI,
    )
  );
  const [scale] = useState(
    Math.random() * 1.5
  );

  if (position.z < 2 && position.z > -2)
    return null;

  return h(actThree.mesh, {
    geometry,
    material,
    position,
    rotation,
    scale: new three.Vector3(scale, scale, scale)
  });
}

const RandomGlyph = () => {
  const [position] = useState(
    new three.Vector3(
      (Math.random() * 50) - 25,
      (Math.random() * 10),
      (Math.random() * 200) - 100,
    )
  );
  const [randomRotation] = useState(Math.random());
  const [maxOpacity] = useState(Math.max(0.5, Math.random()));
  const [color] = useState(new three.Color(`hsl(
    ${Math.random() * 360},
    50%,
    5%
  )`));
  const [glyphName] = useState(effectsCommon.glyph2Names[Math.floor(Math.random() * effectsCommon.glyph2Names.length)]);
  const [scale] = useState(0.7 + Math.random());
  const [spawnTime] = useState(performance.now());

  const texture = useTextureResource(glyphName);

  const material = threeCommon.useDisposable(
    () => {
      const mat = effectsCommon.glitchMaterial.clone()
      //const mat = new three.MeshDepthMaterial();
      mat.side = three.DoubleSide;
      mat.transparent = true;
      mat.color = new three.Color('black');
      return mat;
    }
  );
  useEffect(() => {
    material.map = texture;
    material.needsUpdate = true;
  }, [texture, material, glyphName])

  useAnimation("GlyphFade", (frame) => {
    const { current: el } = ref;
    if (!el)
      return;
    const lifeTime = frame.now - spawnTime;
    material.opacity = Math.min(maxOpacity, lifeTime / 5000)
    el.rotation.setFromVector3(new three.Vector3(
      0,
      (randomRotation + lifeTime / 5000) * Math.PI,
      0
    ))
  });
  const ref = useRef<three.Mesh | null>(null);

  if (position.z < 2 && position.z > -2)
    return null;
  return h(effectsCommon.GlitchMesh, {
    ref,
    normalTime: 5000,
    material,
    position,
    scale: new three.Vector3(scale, scale, scale)
  })
};
