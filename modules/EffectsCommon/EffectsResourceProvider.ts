import { act, threeCommon, gltf, three } from "./deps.ts";
import { concreteURL, forestURL, glyph2URLs } from "./mod.ts";
const { h } = act;

const glitchMeshesURL = new URL("./glitch_meshes.glb", import.meta.url).href;
const gltfLoader = new gltf.GLTFLoader();
const textureLoader = new three.TextureLoader();

export const glitchNames = [
  "BaseGrid",
  "GlitchAGrid",
  "GlitchBGrid",
  "GlitchCGrid",
  "GlitchDGrid",
];

const load = async (): Promise<threeCommon.ResourceSet> => {
  const glitchMeshScene = await gltfLoader.loadAsync(glitchMeshesURL);
  const textures = new Map([
    ...Object.entries(glyph2URLs),
    ['concrete', concreteURL],
    ['forest', forestURL],
  ]
    .map(([textureName, textureURL]) => [textureName, textureLoader.load(textureURL)]))

  for (const name of Object.keys(glyph2URLs)) {
    const texture =textures.get(name);
    if (texture)
      texture.flipY = false;
  }

  const glitchMeshMap = new Map(
    glitchMeshScene.scene.children.map((mesh) => [mesh.name, mesh])
  );
  const glitchGeometryMap = new Map([...glitchMeshMap]
    .map(([name, mesh]) => {
      if (!mesh || !(mesh instanceof three.Mesh))
        throw new Error(`glitch_meshes is missing ${name}`);
      const geometry = mesh.geometry;
      if (!(geometry instanceof three.BufferGeometry))
        throw new Error();
      return [name, geometry];
    }))

  const tiledMeshes = Array.from({ length: 4 }).flatMap((_, tileX) => {
    return Array.from({ length: 4 }).flatMap((_, tileY) => {
      return glitchNames.map((name) => {
        const mesh = glitchMeshMap.get(name);
        if (!mesh || !(mesh instanceof three.Mesh))
          throw new Error(`glitch_meshes is missing ${name}`);
        const originalGeometry = mesh.geometry;
        if (!(originalGeometry instanceof three.BufferGeometry))
          throw new Error();

        const geo = originalGeometry.clone();
        const uvs = geo.getAttribute("uv");
        for (let i = 0; i < uvs.count; i++) {
          const x = uvs.getX(i) / 4 + tileX / 4;
          const y = uvs.getY(i) / 4 + tileY / 4;
          uvs.setXY(i, x, y);
        }
        return [tileX, tileY, name, geo] as const;
      });
    });
  });
  return {
    geometry: new Map([
      ...glitchGeometryMap,
      ...tiledMeshes.map(([x, y, name, geometry]) => [
        [x, y, name].join(""),
        geometry,
      ] as const)
    ]
    ),
    material: new Map(),
    texture: new Map(textures),
  };
};

export const EffectResourcesProvider: act.Component = ({ children }) => {
  return h(threeCommon.ResourceSetProvider, { load }, children);
};
