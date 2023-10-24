import { act, kayo, desk, boxParticle, artifact } from "../deps.ts";
import { useWhiteboardLocalState, useWhiteboardSelector } from "./useWhiteboardState.ts";
import { schedule } from "../../ThreeCommon/deps.ts";
import { CursorIndicator } from "./Cursor.ts";
import { StrokeCanvas } from "./StrokeCanvas.ts";
import { Controls } from "./Controls.ts";
import { DryEraseChannel } from "../channel/channel2.ts";
import { StickerDisplay } from "./StickerDisplay.ts";
const { h, useMemo, useState, useRef } = act;

export type WhiteboardEditorProps = {
  channel: DryEraseChannel;
  artifact: artifact.ArtifactClient,
};

const style = {
  display: "flex",
  flex: 1,
};
const toolbarStyle = {
  backgroundColor: "white",
  borderRadius: "8px",
  padding: "8px",
  margin: "auto auto 24px auto",
  gap: "8px",
  border: "1px solid black",
};

const modes = ["panning", "drawing", "sticking"] as const;

const cursorForMode = {
  panning: "grab",
  drawing: "auto",
  noting: "text",
  sticking: "crosshair",
} as const;

const deskplaneParticleSettings: boxParticle.ParticleSettings = {
  dragCoefficent: 0.005,
  velocityMagnitudeMax: 0.5,
  //bounds: new Box2(new Vector2(-512, -512), new Vector2(512, 512)),
};

export const WhiteboardEditor: act.Component<WhiteboardEditorProps> = ({
  channel,
  artifact,
}) => {
  const [activeMode, setActiveMode] =
    useState<(typeof modes)[number]>("panning");

  const patternRef = useRef<SVGPatternElement | null>(null);
  const cursor = cursorForMode[activeMode];

  const state = useWhiteboardLocalState(channel);

  if (!state)
    return null;

  const cursorIds = useWhiteboardSelector(state, useMemo(() => (state) => {
    return [...state.cursors.keys()];
  }, []), [], (a, b) => a.length === b.length && a.every(i => b.includes(i)))

  const stickerIds = useWhiteboardSelector(state, useMemo(() => (state) => {
    return [...state.stickers.keys()];
  }, []), [], (a, b) => a.length === b.length && a.every(i => b.includes(i)))

  schedule.useAnimation('WhiteboardEditor', () => {
    patternRef.current?.setAttribute("x", state.camera.x.toString());
    patternRef.current?.setAttribute("y", state.camera.y.toString());
  })

  return h("div", { style }, [
    h(desk.GridSVG, {
      patternRef,
      svgProps: { tabindex: 0 },
      style: { cursor, position: "relative", flex: 1 },
    }),
    h(Controls, { key: "controls", state, editorState: { mode: activeMode } }, [
      stickerIds
        .map((stickerId) => h(StickerDisplay, { stickerId, state, artifact, panning: activeMode === 'panning' })),
      h(StrokeCanvas, {
        state,
        key: 'canvas',
        style: {
          position: "absolute",
          height: "100%",
          width: "100%",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        },
      }),
      h(kayo.Toolbar,
        { direction: "down", style: toolbarStyle },
        modes.map((mode) => {
          return h(
            "button",
            { onClick: () => setActiveMode(mode), disabled: mode === activeMode },
            mode
          );
        })
      ),
      cursorIds
        .map((cursorId) => h(CursorIndicator, { cursorId, state })),
    ]),
  ]);
};
