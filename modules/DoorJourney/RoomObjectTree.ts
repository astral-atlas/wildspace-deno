import { useContext, useEffect, useRef } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { m } from "../SesameModels/deps.ts";
import { act, actThree, effects, three, threeCommon } from "./deps.ts";
import { schedule } from "../ThreeCommon/deps.ts";
import { StarField } from "./StarField.ts";
const { h } = act;

const objectUserData = m.union({
  "particle": m.object({
    type: m.literal("particle"),
    name: m.string,
    size: m.number,
  }),
});
const materialUserData = m.union({
  "skybox": m.object({
    type: m.literal('skybox'),
  }),
  "uvpan": m.object({
    type: m.literal("uvpan"),
    x: m.number,
    y: m.number,
  }),
  "water": m.object({
    type: m.literal("water"),
  }),
  "transparent": m.object({
    type: m.literal("transparent"),
  })
})
type ObjectUserData = m.OfModelType<typeof objectUserData>;
type MaterialUserData = m.OfModelType<typeof materialUserData>;
const castObjectUserData = m.createModelCaster(objectUserData);
const castMaterialUserData = m.createModelCaster(materialUserData);

export type RoomObjectTreeProps = {
  object: three.Object3D;
};

export const RoomObjectTree: act.Component<RoomObjectTreeProps> = (
  { object },
) => {
  const children = object.children.map((object) =>
    h(RoomObjectTree, { object })
  );
  switch (object.type) {
    case "Mesh": {
      const mesh = object as three.Mesh;
      return h(RoomMeshTree, { mesh }, children);
    }
    case "Object3D":
      return h(RoomPlaceholderTree, { object }, children);
    default:
      return null;
  }
};

const RoomPlaceholderTree: act.Component<{ object: three.Object3D }> = (
  { object, children },
) => {
  try {
    const userData = castObjectUserData(object.userData);
    switch (userData.type) {
      case "particle":
        return h(ParticleField, { userData, object }, children);
    }
    return children;
  } catch (error) {
    console.warn(error);
    return children;
  }
};

const box = new three.BoxGeometry(10, 10, 10)
const blue = new three.MeshBasicMaterial({ color: 'blue' })
const ParticleField: act.Component<
  { userData: Extract<ObjectUserData, { type: "particle" }>, object: three.Object3D }
> = ({ userData, children, object }) => {
  return h(StarField, { size: new three.Vector3(userData.size, userData.size, userData.size) })
};

type TexuredMaterial =
  | three.MeshBasicMaterial
  | three.MeshStandardMaterial

const RoomMeshTree: act.Component<{ mesh: three.Mesh }> = (
  { mesh, children },
) => {
  if (mesh.material instanceof three.MeshBasicMaterial || mesh.material instanceof three.MeshStandardMaterial) {
    const material = mesh.material;
    if (material.userData.type) {
      const userData = castMaterialUserData(material.userData);
      switch (userData.type) {
        case 'skybox':
          return h(SkyboxMesh, { mesh, material }, children);
        case 'uvpan':
          return h(PanMesh, { mesh, material, userData }, children)
        case 'water':
          return h(WaterMesh, { mesh, material, userData }, children)
        case 'transparent':
          return h(TransparentMesh, { mesh, material }, children)
      }
    }
  }

  return h(actThree.mesh, {
    geometry: mesh.geometry,
    material: mesh.material,

    position: mesh.position,
    quaternion: mesh.quaternion,
    scale: mesh.scale,
  }, children);
};

export type WaterMeshProps = {
  mesh: three.Mesh,
  material: TexuredMaterial,
  userData: Extract<MaterialUserData, { type: "water" }>,
}

const WaterMesh: act.Component<WaterMeshProps> = ({
  mesh,
  material,
  userData,
  children,
}) => {

  //const velocity = useRef(new three.Vector2(userData.x, userData.y)).current
  
  schedule.useAnimation('WaterMesh', (frame) => {
    waterMaterial.time = frame.now / 1000;
  });

  const waterMaterial = threeCommon.useDisposable(() => new effects.WaterShader({
    //map: material.map,
    time: 0,
    //velocity,
    name: material.name,
    depthMultiplier: 0.2,
    color: new three.Color("#0b257a"),
    depthColor: new three.Color('#049ef4'),
    waveFrequency: 5,
    waveSize: 0.5,
    //color: new three.Color('blue')
    //transparent: true,
  }), [])

  return h(actThree.mesh, {
    geometry: mesh.geometry,
    material: waterMaterial,

    position: mesh.position,
    quaternion: mesh.quaternion,
    scale: mesh.scale,
  }, children);
}
export type TransparentMeshProps = {
  mesh: three.Mesh,
  material: TexuredMaterial,
}

export const TransparentMesh: act.Component<TransparentMeshProps> = ({ mesh, material, children }) => {
  const panMaterial = threeCommon.useDisposable(() => new three.MeshBasicMaterial({
    map: material.map,
    name: material.name,
    transparent: true,
    color: 'white',
    side: three.DoubleSide,
    alphaTest: 0.2,
  }), [])

  return h(actThree.mesh, {
    geometry: mesh.geometry,
    material: panMaterial,

    position: mesh.position,
    quaternion: mesh.quaternion,
    scale: mesh.scale,
  }, children);
}

export type PanMeshProps = {
  mesh: three.Mesh,
  material: TexuredMaterial,
  userData: Extract<MaterialUserData, { type: "uvpan" }>,
}


const PanMesh: act.Component<PanMeshProps> = ({
  mesh,
  material,
  userData,
  children,
}) => {
  const velocity = useRef(new three.Vector2(userData.x, userData.y)).current
  
  schedule.useAnimation('PanMesh', (frame) => {
    panMaterial.time = frame.now / 1000;
  });

  const panMaterial = threeCommon.useDisposable(() => new effects.UVPanShader({
    map: material.map,
    time: 0,
    velocity,
    name: material.name,
    vertexColors: true,
    transparent: true,
  }), [])

  return h(actThree.mesh, {
    geometry: mesh.geometry,
    material: panMaterial,

    position: mesh.position,
    quaternion: mesh.quaternion,
    scale: mesh.scale,
  }, children);
}
export type SkyboxMeshProps = {
  mesh: three.Mesh,
  material: TexuredMaterial,
}

const SkyboxMesh: act.Component<SkyboxMeshProps> = ({
  mesh,
  material,
  children,
}) => {
  const renderContext = useContext(threeCommon.renderSetupContext);

  if (!renderContext)
    return null;

  const skyboxMaterial = threeCommon.useDisposable(() => new effects.SkyboxMaterial({
    map: material.map,
    name: material.name
  }), [])
  useEffect(() => {
    const {current: renderer} = renderContext.rendererRef
    if (!renderer)
      return;

    const onSizeChange = () => {
      renderer.getSize(skyboxMaterial.resolution);
      skyboxMaterial.needsUpdate = true;
    }
    renderContext.rendererResize.subscribe(() => {
      onSizeChange()
    })
    onSizeChange();
  }, [])

  return h(actThree.mesh, {
    geometry: mesh.geometry,
    material: skyboxMaterial,

    position: mesh.position,
    quaternion: mesh.quaternion,
    scale: mesh.scale,
  }, children);
}