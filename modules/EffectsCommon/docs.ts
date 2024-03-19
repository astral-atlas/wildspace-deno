import {
  h,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "@lukekaalim/act";
import { act, actThree, componentDoc, three, threeCommon } from "./deps.ts";

// @deno-types="vite-text"
import readme from "./readme.md?raw";
import { OrbitSceneCanvas } from "../ThreeCommonDoc/mod.ts";
import { GlitchMesh } from "./GlitchMesh.ts";
import { LoopingTrack } from "./LoopingTrack.ts";
import { SimpleCanvas } from "../ThreeCommon/SimpleCanvas.ts";
import { FramePresenter } from "../ComponentDoc/FramePresenter.ts";
import {
  EffectResourcesProvider,
  glitchNames,
} from "./EffectsResourceProvider.ts";
import { glyph2Names, WaterShader } from "./mod.ts";
import { useTextureResource } from "../ThreeCommon/ResourceSet.ts";
import { useDisposable } from "../ThreeCommon/useDisposable.ts";
import { SkyboxMaterial } from "./SkyboxShader/mod.ts";
import { useAnimation } from "../FrameScheduler/useAnimation.ts";

const subdiviedPlane = new three.PlaneGeometry(100, 100, 100, 100);
subdiviedPlane.rotateX(Math.PI * -0.5);

const WaterShaderDemo = () => {
  const [color, setColor] = useState(new three.Color("#0b257a"));
  const [depthColor, setDepthColor] = useState(new three.Color("#049ef4"));
  const [depthMultiplier, setDepthMultiplier] = useState(0.2);
  const [waveSize, setWaveSize] = useState(1);
  const [waveFrequency, setWaveFrequency] = useState(1);

  const onColorInput = (event: Event) => {
    const value = (event.target as HTMLInputElement).value;
    setColor(new three.Color(value));
  };
  const onDepthColorInput = (event: Event) => {
    const value = (event.target as HTMLInputElement).value;
    setDepthColor(new three.Color(value));
  };
  const onDepthMultiplierInput = (event: Event) => {
    const value = (event.target as HTMLInputElement).value;
    setDepthMultiplier(parseFloat(value));
  };
  const onWaveSizeInput = (event: Event) => {
    const value = (event.target as HTMLInputElement).value;
    setWaveSize(parseFloat(value));
  };
  const onWaveFrequencyInput = (event: Event) => {
    const value = (event.target as HTMLInputElement).value;
    setWaveFrequency(parseFloat(value));
  };
  const material = threeCommon.useDisposable(() => {
    return new WaterShader();
  });
  useEffect(() => {
    material.color = color;
    material.depthColor = depthColor;
    material.depthMultiplier = depthMultiplier;
    material.waveSize = waveSize;
    material.waveFrequency = waveFrequency;
  }, [color, depthColor, depthMultiplier, waveSize, waveFrequency]);

  useAnimation("WaterShaderDemo", (frame) => {
    material.time = frame.now / 1000;
  });

  return [
    h("pre", {}, JSON.stringify(color.getHexString())),
    h("pre", {}, JSON.stringify(depthColor.getHexString())),
    h("pre", {}, JSON.stringify(depthMultiplier)),
    h("input", {
      type: "color",
      onInput: onColorInput,
      value: "#" + color.getHexString(),
    }),
    h("input", {
      type: "color",
      onInput: onDepthColorInput,
      value: "#" + depthColor.getHexString(),
    }),
    h("input", {
      type: "number",
      onInput: onDepthMultiplierInput,
      value: depthMultiplier,
      step: 0.01,
    }),
    h("input", {
      type: "number",
      onInput: onWaveSizeInput,
      value: waveSize,
      step: 0.05,
    }),
    h("input", {
      type: "number",
      onInput: onWaveFrequencyInput,
      value: waveFrequency,
      step: 0.05,
    }),
    h(OrbitSceneCanvas, {
      height: 10,
    }, [
      h(actThree.mesh, { geometry: subdiviedPlane, material }),
    ]),
  ];
};

const GlitchMeshDemo = () => {
  const [i, setI] = useState(0);
  const [s, setS] = useState(0);
  const onInput = (e: InputEvent) => {
    if (e.target instanceof HTMLInputElement) {
      setI(Number.parseInt(e.target.value));
    }
  };
  const onSelect = (e: InputEvent) => {
    if (e.target instanceof HTMLSelectElement) {
      console.log("seting");
      setS(Number.parseInt(e.target.value));
    }
  };
  const boundedI = Math.abs(i % 16);
  console.log({ s });
  return [
    h("input", { type: "number", onInput, value: i }),
    h(
      "select",
      { onInput: onSelect },
      glitchNames.map((name, index) =>
        h("option", { selected: s === index, value: index }, name)
      ),
    ),

    h(OrbitSceneCanvas, {}, [
      h(GlitchMesh, {
        tile: new three.Vector2(boundedI % 4, Math.floor(boundedI / 4)),
        state: glitchNames[s],
        scale: new three.Vector3(10, 10, 10),
      }),
    ]),
  ];
};

const box = new three.BoxGeometry(20, 20, 20);
const material = new three.LineBasicMaterial({ color: "red" });

const demos = {
  water_demo: WaterShaderDemo,
  glyph_demo() {
    const [selectedName, setSelectedName] = useState(glyph2Names[0]);
    const texture = useTextureResource(selectedName);
    const material = threeCommon.useDisposable(() => {
      return new three.MeshBasicMaterial({
        map: texture,
        color: "red",
        transparent: true,
      });
    });
    useEffect(() => {
      material.map = texture;
      material.needsUpdate = true;
      console.log(material);
    }, [texture]);
    console.log(texture);
    return [
      h(
        "select",
        {
          onInput: (e) => setSelectedName(e.target.value),
        },
        glyph2Names.map((name) =>
          h("option", { selected: selectedName === name }, name)
        ),
      ),
      h(OrbitSceneCanvas, {}, [
        h(actThree.mesh, { geometry: box, material }),
      ]),
    ];
  },
  skybox_demo() {
    const texture = useTextureResource("forest");
    if (!texture)
      return null;
    const skyboxMaterial = useDisposable(() =>
      new SkyboxMaterial({ map: texture })
    );
    const rendererRef = useRef<null | three.WebGLRenderer>(null);
    
    const onSizeChange = () => {
      const { current: renderer } = rendererRef;
      if (!renderer)
        return;
      skyboxMaterial.resolution = renderer.getSize(skyboxMaterial.resolution);
      skyboxMaterial.needsUpdate = true;
    }

    return h(OrbitSceneCanvas,
      { simpleCanvas: { overrides: { rendererRef }, onResize: onSizeChange } },
      h(actThree.mesh, {
        geometry: box,
        material: skyboxMaterial,
        scale: new three.Vector3(1.5, 1.5, 1.5),
      }),
    );
  },
  "glitch-mesh": GlitchMeshDemo,
  looping_track: () => {
    const [cameraHelper, setCameraHelper] = useState<three.CameraHelper | null>(
      null,
    );
    const cameraRef = useRef(null);

    useEffect(() => {
      if (!cameraRef.current) return;
      setCameraHelper(new three.CameraHelper(cameraRef.current));
    }, []);
    const fpCameraRef = useRef(null);

    return [
      h(OrbitSceneCanvas, {}, [
        h(LoopingTrack, {
          size: 20,
          count: 5,
          period: 3000,
          renderContent(distance) {
            return h(Child, { distance });
          },
        }),
        h(actThree.line, {
          geometry: boxEdges,
          material,
          scale: new three.Vector3(1.2, 1.2, 1.2),
        }),
        h(actThree.perspectiveCamera, {
          ref: cameraRef,
          rotation: new three.Euler(0, Math.PI / 2, 0),
        }),
        h(threeCommon.ObjectAttacher, { object: cameraHelper }),
      ]),
      h(FramePresenter, {}, [
        h(SimpleCanvas, { overrides: { cameraRef: fpCameraRef } }, [
          h(actThree.perspectiveCamera, {
            ref: fpCameraRef,
            rotation: new three.Euler(0, Math.PI / 2, 0),
          }),
          h(LoopingTrack, {
            size: 20,
            count: 5,
            period: 3000,
            renderContent(distance) {
              return h(Child, { key: distance.toString(), distance });
            },
          }),
        ]),
      ]),
    ];
  },
};

const boxEdges = new three.EdgesGeometry(box);
const smallBox = new three.BoxGeometry(5, 5, 5);
const lineMaterial = new three.LineBasicMaterial({
  color: "black",
});

const Child: act.Component<
  { distance: number; lines?: boolean; key?: string }
> = ({ distance, lines }) => {
  const material = useRef(
    new three.MeshBasicMaterial({
      color: new three.Color(`hsl(${(distance * 10) % 360}, 50%, 50%)`),
    }),
  ).current;

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, []);

  return h(
    actThree.line,
    {
      geometry: boxEdges,
      material: lineMaterial,
    },
    h(actThree.mesh, {
      geometry: smallBox,
      material,
      position: new three.Vector3(
        0,
        Math.sin(distance / 2) * 5,
        Math.cos(distance / 2) * 5,
      ),
    }),
  );
};

export const effectsCommonDocs: componentDoc.DocSheet[] = [
  componentDoc.markdownToSheet(
    "EffectsCommon",
    readme,
    demos,
    EffectResourcesProvider,
  ),
];
