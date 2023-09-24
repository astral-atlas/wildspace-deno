import {
  Component, ElementNode, h, useRef,
} from "https://esm.sh/@lukekaalim/act@2.6.0";
import { GridSVG } from "./GridSVG.ts";
import { ParticleSettings } from "../BoxParticle/particle.ts";
import { useDraggableParticle } from "./useDraggableParticle.ts";
import { three } from "./deps.ts";

export type DeskplaneProps = {
  particleSettings?: ParticleSettings;
  overlayChildren?: ElementNode
};

const deskplaneParticleSettings: ParticleSettings = {
  dragCoefficent: 0.005,
  velocityMagnitudeMax: 0.5,
  bounds: new three.Box2(new three.Vector2(-512, -512), new three.Vector2(512, 512)),
};

export const Deskplane: Component<DeskplaneProps> = ({
  particleSettings = deskplaneParticleSettings,
  children,
  overlayChildren = null
}) => {
  const elementRef = useRef(null);
  const patternRef = useRef<SVGPatternElement | null>(null);
  const childrenRef = useRef<HTMLElement | null>(null);

  const { dragging, particle } = useDraggableParticle(elementRef, particleSettings, (particle) => {
    if (childrenRef.current) {
      childrenRef.current.style.transform = `translate(${particle.position.x}px, ${particle.position.y}px)`;
    }
    patternRef.current?.setAttribute("x", particle.position.x.toString());
    patternRef.current?.setAttribute("y", particle.position.y.toString());
  })

  const style = {
    cursor: dragging ? "grabbing" : null,
    overflow: "hidden",
    position: 'relative',
    border: '1px solid black',
    display: 'flex',
  };
  const svgStyle = {
    pointerEvents: 'none',
    display: 'flex',
    flex: 1,
    height: '513px',
  }

  return h("div", { tabIndex: 0, style, ref: elementRef }, [
    h(GridSVG, { patternRef, style: svgStyle }),
    h("div", {
        ref: childrenRef,
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          transform: `translate(${particle.position.x}px, ${particle.position.y}px)`,
        },
      },
      children
    ),
    overlayChildren,
  ]);
};
