import { glitchNames } from "./EffectsResourceProvider.ts";
import { act, actThree, three, gltf, threeCommon } from "./deps.ts";
import { glyph2URLs } from "./mod.ts";
const { h, useEffect, useState } = act;

const glyphsURL = new URL("./glyphs.png", import.meta.url).href;
const glitchMeshesURL = new URL("./glitch_meshes.glb", import.meta.url).href;

const textureLoader = new three.TextureLoader();
const gltfLoader = new gltf.GLTFLoader();

const map = textureLoader.load(glyphsURL);
map.flipY = false;

export const glitchMaterial = new three.MeshBasicMaterial({
  map,
  color: "grey",
  transparent: true,
  side: three.DoubleSide,
});
map.minFilter = three.NearestFilter;
map.magFilter = three.NearestFilter;

export type GlitchMeshProps = {
  state?: (typeof glitchNames)[number];
  glitchTime?: number;
  normalTime?: number;
} & actThree.MeshProps;

export const GlitchMesh: act.Component<GlitchMeshProps> = ({
  glitchTime = 250,
  normalTime = 1000,
  ...objectProps
}) => {
  const ref = threeCommon.useOverridableRef<three.Mesh>(
    (typeof objectProps.ref === "object" && objectProps.ref) || null
  );

  const [glitchState, setGlitchState] = useState(0);
  const name = glitchNames[glitchState];

  const geometry = threeCommon.useGeometryResource(name);

  useEffect(() => {
    const runGlitch = () => {
      setGlitchState(Math.floor(Math.random() * (glitchNames.length - 1)) + 1);
      id = setTimeout(runNormal, Math.random() * glitchTime);
    };
    const runNormal = () => {
      setGlitchState(0);
      id = setTimeout(runGlitch, Math.random() * normalTime);
    };
    let id = setTimeout(runGlitch, Math.random() * normalTime);
    return () => {
      clearTimeout(id);
    };
  }, []);

  if (!geometry) return null;

  return h(actThree.mesh, {
    material: glitchMaterial,
    geometry,
    ...objectProps,
    ref,
  });
};
