import { act, boxParticle, desk, three } from "../deps.ts";
import { WhiteboardLocalState, WhiteboardEditorState } from "./useWhiteboardState.ts";

const { h, useRef, useState } = act;

export type ControlsProps = {
  state: WhiteboardLocalState,
  editorState: WhiteboardEditorState,
};

const style = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

const deskplaneParticleSettings: boxParticle.ParticleSettings = {
  dragCoefficent: 0.005,
  velocityMagnitudeMax: 0.5,
  //bounds: new Box2(new Vector2(-512, -512), new Vector2(512, 512)),
};

export const Controls: act.Component<ControlsProps> = ({
  state,
  editorState
}) => {
  const elementRef = useRef<null | HTMLElement>(null)
  
  desk.useDraggableParticle(elementRef, deskplaneParticleSettings, (particle) => {
    state.camera.copy(particle.position);
  }, editorState.mode === 'panning')

  const onPointerMove = (event: PointerEvent) => {
    const x = event.offsetX - state.camera.x;
    const y = event.offsetY - state.camera.y;
    state.channel.send({
      type: "pointer-move",
      position: { x, y },
    });
  };
  const [boxStart, setBoxStart] = useState<null | three.Vector2>(null);

  const onPointerDown = (event: PointerEvent) => {
    const x = event.offsetX - state.camera.x;
    const y = event.offsetY - state.camera.y;
    setBoxStart(new three.Vector2(x, y))
    if (editorState.mode === "drawing") {
      state.channel.send({
        type: "stroke-start",
      });
    }
  };
  const onPointerUp = (event: PointerEvent) => {
    if (!boxStart)
      return;
    const x = event.offsetX - state.camera.x;
    const y = event.offsetY - state.camera.y;
    setBoxStart(null);
    const boxEnd = new three.Vector2(x, y);
    //const box = new three.Box2(boxStart, boxEnd);
    if (editorState.mode === "drawing") {
      state.channel.send({
        type: "stroke-end",
      });
    }
    if (editorState.mode === 'noting' && boxStart) {
      state.channel.send({
        type: 'note-submit',
        position: boxStart,
        size: { x: boxEnd.x - boxStart.x, y: boxEnd.y - boxStart.y },
      })
    }
  };

  return h('div', {
    style,
    ref: elementRef,
    onPointerMove,
    onPointerUp,
    onPointerDown,
  })
};