import { act, threeCommon, gltf, three } from "./deps.ts";
const { h } = act;

const glitchMeshesURL = new URL("./glitch_meshes.glb", import.meta.url).href;
const gltfLoader = new gltf.GLTFLoader();

export const glitchNames = [
  "BaseGrid",
  "GlitchAGrid",
  "GlitchBGrid",
  "GlitchCGrid",
  "GlitchDGrid",
];

const load = async (): Promise<threeCommon.ResourceSet> => {
  const glitchMeshScene = await gltfLoader.loadAsync(glitchMeshesURL);

  const glitchMeshMap = new Map(
    glitchMeshScene.scene.children.map((mesh) => [mesh.name, mesh])
  );

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
    geometry: new Map(
      tiledMeshes.map(([x, y, name, geometry]) => [
        [x, y, name].join(""),
        geometry,
      ])
    ),
    material: new Map(),
    texture: new Map(),
  };
};

export const EffectResourcesProvider: act.Component = ({ children }) => {
  return h(threeCommon.ResourceSetProvider, { load }, children);
};
