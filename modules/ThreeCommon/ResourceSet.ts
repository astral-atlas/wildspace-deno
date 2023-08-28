import { useMemo } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { act, three } from "./deps.ts";
const { createContext, h, useEffect, useState, useContext } = act;

export type ResourceSet = {
  texture: Map<string, three.Texture>;
  material: Map<string, three.Material>;
  geometry: Map<string, three.BufferGeometry>;
};

export const emptyResourceSet: ResourceSet = {
  texture: new Map(),
  material: new Map(),
  geometry: new Map(),
};

export const resourceSetContext = createContext<ResourceSet>(emptyResourceSet);

export type ResourceSetProviderProps = {
  load: () => Promise<ResourceSet>;
};

export const ResourceSetProvider: act.Component<ResourceSetProviderProps> = ({
  children,
  load,
}) => {
  const [resources, setResources] = useState(emptyResourceSet);
  const contextResources = useContext(resourceSetContext);

  useEffect(() => {
    load()
      .then(setResources)
      .catch(console.error);
  }, []);

  const mergedSet = useMemo(
    () => ({
      texture: new Map([...resources.texture, ...contextResources.texture]),
      material: new Map([...resources.material, ...contextResources.material]),
      geometry: new Map([...resources.geometry, ...contextResources.geometry]),
    }),
    [resources, contextResources]
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
