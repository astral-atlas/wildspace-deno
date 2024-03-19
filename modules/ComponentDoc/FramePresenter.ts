// @flow strict

import {
  h,
  Component,
  useState,
  useEffect,
  useRef,
} from "@lukekaalim/act";

// @deno-types="vite-css"
import styles from "./FramePresenter.module.css";
import { randomSoftColor } from "../RandomThingGenerator/random.ts";

export type FramePresenterProps = {
  height?: string;
  negativeMargin?: number;
  padding?: string;
  backgroundColor?: string;
};

export const FramePresenter: Component<FramePresenterProps> = ({
  children,
  //style,
  height = "512px",
  negativeMargin = 0,
  padding = "0px",
  backgroundColor = randomSoftColor(),
}) => {
  const ref = useRef<null | HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const onFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    setFullscreen(!!document.fullscreenElement);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    }
  }, [])

  const contentRef = useRef<HTMLDivElement | null>(null);

  return h("div",
    {
      ref,
      style: { display: 'flex', flexDirection: 'column' }
    },
    [
      h("div", {
          class: styles.framePresenterContainer,
          style: {
            maxHeight: fullscreen ? 'none' : height,
            minHeight: height,
            backgroundColor,
            flex: 1,
            overflow: 'hidden',
            marginLeft: `${-negativeMargin}px`,
            marginRight: `${-negativeMargin}px`,
          },
        },
        [
          h("div", {
              class: styles.framePresenterContent,
              ref: contentRef,
              style: {
                position: "relative",
                width: '100%',
                height: fullscreen ? '100%' : height,
                maxWidth: "100%",
                maxHeight: fullscreen ? 'initial' : height,
                boxSizing: "border-box",
                resize: "both",
                overflow: "hidden",
                padding,
              },
            },
            children
          ),
        ]
      ),
      h("button",
        { onClick: () => {
          if (fullscreen)
            document.exitFullscreen();
          else
            ref.current?.requestFullscreen()
         } },
         fullscreen ? "Exit Fullscreen" : "Fullscreen"
      ),
    ]
  );
};

export type ScalableFramePresenterProps = {};

export const ScalableFramePresenter: Component<ScalableFramePresenterProps> = ({
  children,
  style,
  height,
}) => {
  const [scale, setScale] = useState(1);
  const ref = useRef();
  const onSetFullscreen = () => {
    const { current: element } = ref;
    if (element instanceof HTMLElement) element.requestFullscreen();
  };
  return [
    h(LayoutDemo, { style, height }, [
      h(
        "div",
        {
          ref,
          style: {
            ...style,
            backgroundColor: "white",
            transformOrigin: "0 0",
            transform: `scale(${scale})`,
            width: `${100 / scale}%`,
            height: `${100 / scale}%`,
          },
        },
        children
      ),
    ]),
    h("div", { style: { backgroundColor: "#e8e8e8" } }, [
      h(EditorForm, {}, [
        h(EditorHorizontalSection, {}, [
          h(EditorButton, {
            label: "Fullscreen",
            onButtonClick: onSetFullscreen,
          }),
          h(EditorRangeInput, {
            label: "Scale",
            min: 0.1,
            step: 0.001,
            max: 1,
            number: scale,
            onNumberInput: (scale) => setScale(scale),
          }),
        ]),
      ]),
    ]),
  ];
};
