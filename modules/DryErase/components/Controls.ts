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
  editorState,
  children
}) => {
  const elementRef = useRef<null | HTMLElement>(null)
  
  desk.useDraggableParticle(elementRef, deskplaneParticleSettings, (particle) => {
    state.camera.copy(particle.position);
  }, editorState.mode === 'panning')

  const [strokeStart, setStrokeStart] = useState<boolean>(false);
  const [boxStart, setBoxStart] = useState<null | three.Vector2>(null);

  const getPosition = (event: PointerEvent) => {
    const { current: element } = elementRef;
    if (!element)
      return { x: 0, y: 0};
    const rect = element.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    const x = offsetX - state.camera.x;
    const y = offsetY - state.camera.y;
    return { x, y }
  }

  const onPointerMove = (event: PointerEvent) => {
    const { x, y } = getPosition(event)
    state.channel.send({
      type: "move-cursor",
      position: { x, y },
    });
    if (strokeStart) {
      state.channel.send({
        type: "update-object",
        update: { type: "draw", points: [{ x, y }] },
      });
    }
    if (boxStart) {
      const size = {
        x: x - boxStart.x,
        y: y - boxStart.y,
      }
      state.channel.send({
        type: "update-object",
        update: { type: "transform", position: null, size },
      });
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    const { x, y } = getPosition(event)
    if (editorState.mode === "drawing") {
      event.preventDefault();
      state.channel.send({
        type: "create-object",
        objectType: "stroke"
      });
      setStrokeStart(true);
    }
    if (editorState.mode === "sticking") {
      if (event.target !== event.currentTarget)
        return;
      state.channel.send({
        type: "create-object",
        objectType: "sticker"
      });
      setBoxStart(new three.Vector2(x, y))
    }
  };
  const onPointerUp = (event: PointerEvent) => {
    if (!boxStart && !strokeStart)
      return;
    const x = event.offsetX - state.camera.x;
    const y = event.offsetY - state.camera.y;
    setBoxStart(null);
    setStrokeStart(false);
    const boxEnd = new three.Vector2(x, y);
    //const box = new three.Box2(boxStart, boxEnd);
    if (editorState.mode === "drawing" && strokeStart) {
      state.channel.send({
        type: "select-object",
        target: { type: 'null' }
      });
    }
    if (editorState.mode === 'sticking' && boxStart) {
      state.channel.send({
        type: "select-object",
        target: { type: 'null' }
      });
    }
  };

  return h('div', {
    style,
    ref: elementRef,
    onPointerMove,
    onPointerUp,
    onPointerDown,
  }, children)
};