import { useEffect, useRef, useState } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { atlasRenderer, threeCommon, effectsCommon, three } from "./deps.ts";
import { useAnimation } from "../../modules/FrameScheduler/useAnimation.ts";
import { MeshBasicMaterial } from "https://esm.sh/three@0.155.0";

const {
  actThree,
  act: { h },
} = atlasRenderer;

export const SesamePage = () => {
  const cameraRef = useRef<three.PerspectiveCamera | null>(null);

  return h("div", { style: { display: "flex", flex: 1, overflow: 'hidden' } }, [
    h(effectsCommon.EffectResourcesProvider, {},
      h(threeCommon.SimpleCanvas, { overrides: { cameraRef } }, [
        h(effectsCommon.LoopingTrack, {
          renderContent() {
            return h(RandomGlyphField);
          },
          size: 50,
          count: 6,
          period: 3000,
        }),
        h(effectsCommon.LoopingTrack, {
          renderContent() {
            return h(RandomGlyphField);
          },
          size: 100,
          count: 3,
          period: 5500,
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
  const [spawnTime] = useState(performance.now());
  const ref = useRef<three.Group | null>(null);

  useAnimation("GlyphFall", (frame) => {
    const lifeTime = frame.now - spawnTime;
    const { current: el } = ref;
    if (!el)
      return;
    el.position.setY(20 - lifeTime  / 500);
  });

  return h(actThree.group, { ref }, [
    Array.from({ length: count + 10 }).map(() => h(RandomGlyph))
  ]);
};

const RandomGlyph = () => {
  const [position] = useState(
    new three.Vector3(
      (Math.random() * 100) - 50,
      (Math.random() * 20) - 10,
      (Math.random() * 50) - 25
    )
  );
  const [randomRotation] = useState(Math.random());
  const [maxOpacity] = useState(Math.random());
  const [color] = useState(new three.Color(`hsl(
    ${Math.random() * 360},
    50%,
    5%
  )`));
  const [tileX] = useState(Math.floor(Math.random() * 4));
  const [tileY] = useState(Math.floor(Math.random() * 4));
  const [scale] = useState(0.7 + Math.random());
  const [spawnTime] = useState(performance.now());
  const material = threeCommon.useDisposable(
    () => {
      const mat = effectsCommon.glitchMaterial.clone()
      //const mat = new three.MeshDepthMaterial();
      mat.side = three.DoubleSide;
      mat.transparent = true;
      mat.color = color;
      return mat;
    }
  );

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

  return h(effectsCommon.GlitchMesh, {
    ref,
    tile: new three.Vector2(tileX, tileY),
    normalTime: 5000,
    material,
    position,
    scale: new three.Vector3(scale, scale, scale)
  })
};
