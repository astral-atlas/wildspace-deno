import { useEffect } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { FramePresenter } from "../ComponentDoc/FramePresenter.ts";
import { DocSheet, markdownToSheet } from "../ComponentDoc/mod.ts";
import { SimpleCanvas } from "../ThreeCommon/SimpleCanvas.ts";
import { OrbitSceneCanvas } from "../ThreeCommonDoc/OrbitSceneCanvas.ts";
import { DoorJourney } from "./DoorJourney.ts";
import { DoorJourneyResourceProvider } from "./DoorJourneyResourceProvider.ts";
import { act, actThree, effects, frame, three, threeCommon } from "./deps.ts";

// @deno-types="vite-text"
import readme from "./readme.md?raw";
import { RoomObjectTree } from "./RoomObjectTree.ts";
import { portalConceptURL } from "./textures/concepts.ts";
const { h, useRef } = act;

const box = new three.BoxGeometry(5, 5, 5);
const red = new three.MeshBasicMaterial({ color: "red" });
const blue = new three.MeshBasicMaterial({ color: "blue" });
const yellow = new three.MeshBasicMaterial({ color: "yellow" });
const green = new three.MeshBasicMaterial({ color: "green" });

const DemoContext: act.Component = ({ children }) => {
  return h(effects.EffectResourcesProvider, {},
    h(DoorJourneyResourceProvider, {}, children));
}

const images = {
  portalConcept: portalConceptURL,
} as Record<string, URL>

const ImgComponent = ({ node }) => {
  return h('img', { src: images[node.attributes.id].href })
}

export const doorJourneyDocs: DocSheet[] = [
  markdownToSheet("DoorJourney", readme, {
    img: ImgComponent,
    room({ node }) {
      const room = threeCommon.useObjectResource(node.attributes.name || 'RiverRoom');

      return h(OrbitSceneCanvas, {}, [
        room && h(RoomObjectTree, { object: room })
      ])
    },
    river_room: () => {
      const riverRoom = threeCommon.useObjectResource('RiverRoom');

      return h(OrbitSceneCanvas, {}, [
        riverRoom && h(RoomObjectTree, { object: riverRoom })
      ])
    },
    star_room: () => {
      const starRoom = threeCommon.useObjectResource('StarfieldRoom');
      return h(OrbitSceneCanvas, {}, [
        starRoom && h(RoomObjectTree, { object: starRoom })
      ])
    },
    "door_journey_demo": () => {
      const cameraRef = useRef<three.PerspectiveCamera | null>(null);
      const sceneRef = useRef<three.Scene | null>(null);
      const ref = useRef<three.Group | null>(null);

      frame.useAnimation("RotateRoom", () => {
        if (!cameraRef.current) {
          return;
        }
        //cameraRef.current.rotateY(Math.PI / 360)
      });
      useEffect(() => {
        if (sceneRef.current)
          sceneRef.current.fog = new three.Fog(new three.Color("black"), 150, 250)
        console.log(sceneRef.current?.fog)
        
      }, [])

      return h(FramePresenter, {}, [
        h(threeCommon.SimpleCanvas, {
          overrides: { cameraRef, sceneRef },
          sceneProps: {
            background: new three.Color("black"),
          },
        }, [
          h(actThree.perspectiveCamera, {
            ref: cameraRef,
            far: 10000,
            fov: 100,
            rotation: new three.Euler(0, Math.PI * 0.50, 0),
          }),
          h(effects.EffectResourcesProvider, {}, [
            h(DoorJourneyResourceProvider, {}, [
              h(effects.LoopingTrack, {
                period: 8000,
                size: 101,
                count: 3,
                renderContent() {
                  return h(DoorJourney);
                },
              }),
            ]),
          ]),
        ]),
      ]);
    },
  }, 
  DemoContext,
  ),
];
