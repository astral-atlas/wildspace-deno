import { useMemo } from "@lukekaalim/act";
import { act, three } from "./deps.ts";
const { createContext, h, useEffect, useState, useContext } = act;

export type ResourceSet = {
  texture: Map<string, three.Texture>;
  material: Map<string, three.Material>;
  geometry: Map<string, three.BufferGeometry>;
  object: Map<string, three.Object3D>;
};

export const emptyResourceSet: ResourceSet = {
  texture: new Map(),
  material: new Map(),
  geometry: new Map(),
  object: new Map(),
};

export const mergeResourceSet = (setA: ResourceSet, setB: Partial<ResourceSet>): ResourceSet => {
  return {
    texture: new Map([...setA.texture, ...setB.texture || []]),
    material: new Map([...setA.material, ...setB.material || []]),
    geometry: new Map([...setA.geometry, ...setB.geometry || []]),
    object: new Map([...setA.object, ...setB.object || []]),
  }
}

export const resourceSetContext = createContext<ResourceSet>(emptyResourceSet);

export type ResourceSetProviderProps = {
  load: () => Promise<Partial<ResourceSet>>;
};

export const ResourceSetProvider: act.Component<ResourceSetProviderProps> = ({
  children,
  load,
}) => {
  const [localResources, setLocalResources] = useState<Partial<ResourceSet>>({});
  const contextResources = useContext(resourceSetContext);

  useEffect(() => {
    load()
      .then(setLocalResources)
      .catch(console.error);
  }, []);

  const mergedSet = useMemo(
    () => mergeResourceSet(contextResources, localResources),
    [localResources, contextResources]
  );

  return h(resourceSetContext.Provider, { value: mergedSet }, children);
};

export const useTextureResource = (key: string): three.Texture | null => {
  const { texture } = useContext(resourceSetContext);
  return texture.get(key) || null;
};
export const useMaterialResource = (key: string): three.Material | null => {
  const { material } = useContext(resourceSetContext);
  return material.get(key) || null;
};
export const useGeometryResource = (
  key: string
): three.BufferGeometry | null => {
  const { geometry } = useContext(resourceSetContext);
  return geometry.get(key) || null;
};
export const useObjectResource = (
  key: string
): three.Object3D | null => {
  const { object } = useContext(resourceSetContext);
  return object.get(key) || null;
};

