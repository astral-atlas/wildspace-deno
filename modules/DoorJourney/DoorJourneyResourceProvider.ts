import { useContext } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { useAsync } from "../AtlasRenderer/useAsync.ts";
import { act, effects, three, threeCommon } from "./deps.ts";
import { roomsURL } from "./scenes/scenes.ts";
import { mergeResourceSet } from "../ThreeCommon/ResourceSet.ts";
import { starRoomParticles } from "./textures/starRoomParticles.ts";

const loader = new threeCommon.gltf.GLTFLoader();
const textureLoader = new three.TextureLoader();

const load = async () => {
  const roomGltf = await loader.loadAsync(roomsURL.href);
  const roomTextures = [
    ...Object.entries(starRoomParticles as Record<string, string>)
  ].map(([name, url]) => [name, textureLoader.load(url)] as const)

  const roomObjects = roomGltf.scene.children
    .map((child) => [child.name, child] as const);

  for (const [,object] of roomObjects)
    object.position.set(0,0,0);

  console.log(roomTextures)

  return {
    object: new Map(roomObjects),
    texture: new Map(roomTextures)
  } as const;
};

export const DoorJourneyResourceProvider: act.Component = ({ children }) => {
  const parentSet = useContext(threeCommon.resourceSetContext);

  const [loadedResources] = useAsync(async () => await load());
  const mergedSet = act.useMemo(() =>
    loadedResources && mergeResourceSet(parentSet, loadedResources) || parentSet
  , [parentSet, loadedResources]);

  return act.h(
    threeCommon.resourceSetContext.Provider,
    { value: mergedSet },
    children,
  );
};
