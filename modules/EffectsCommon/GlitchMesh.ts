import { act, actThree, three, gltf } from "./deps.ts";
const { h, useEffect, useState } = act;

const glyphsURL       = new URL('./glyphs.png', import.meta.url).href
const glitchMeshesURL = new URL('./glitch_meshes.glb', import.meta.url).href


const textureLoader = new three.TextureLoader();
const gltfLoader = new gltf.GLTFLoader();

const map = textureLoader.load(glyphsURL);
map.flipY = false;

const material = new three.MeshBasicMaterial({
  map,
  color: "grey",
  transparent: true,
  side: three.DoubleSide,
});
map.minFilter = three.NearestFilter;
map.magFilter = three.NearestFilter;

export const glitchNames = [
  "BaseGrid",
  "GlitchAGrid",
  "GlitchBGrid",
  "GlitchCGrid",
  "GlitchDGrid",
];

const loadTiledMeshes = async () => {
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
  return tiledMeshes;
};

export type GlitchMeshProps = {
  tile: three.Vector2;
  state?: (typeof glitchNames)[number];
};

export const GlitchMesh: act.Component<GlitchMeshProps> = ({ tile }) => {
  const [tiledMeshes, setTiledMeshes] = useState<
    null | (readonly [number, number, string, three.BufferGeometry])[]
  >(null);
  useEffect(() => {
    loadTiledMeshes()
      .then((tiledMeshes) => setTiledMeshes(tiledMeshes))
      .catch(console.error);
  }, []);

  const [glitchState, setGlitchState] = useState(0);

  useEffect(() => {
    const runGlitch = () => {
      setGlitchState(Math.floor(Math.random() * (glitchNames.length - 1)) + 1);
      id = setTimeout(runNormal, Math.random() * 250);
    };
    const runNormal = () => {
      setGlitchState(0);
      id = setTimeout(runGlitch, Math.random() * 1000);
    };
    let id = setTimeout(runGlitch, 1000);
    return () => {
      clearTimeout(id);
    };
  }, []);

  if (!tiledMeshes) return null;

  const state = glitchNames[glitchState];

  const tileSet = tiledMeshes.find(([tileX, tileY, tileState]) => {
    return tileX === tile.x && tileY === tile.y && tileState === state;
  });

  console.log(tileSet);

  return h(actThree.mesh, {
    material,
    scale: new three.Vector3(10, 10, 10),
    geometry: (tileSet && tileSet[3]) || tiledMeshes[0][3],
  });
};
