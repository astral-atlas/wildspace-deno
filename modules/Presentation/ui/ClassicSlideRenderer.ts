import { act, actCommon, artifact } from "../deps.ts";
import { Slide, SlideAsset, SlideContent } from "../slide.ts";
import { BackgroundRenderer, SlideRendererProps } from "./SlideRenderer.ts";

const { h, useState, useEffect } = act;
const { useAsync, useDisposable } = actCommon;

export type ClassicSlideRendererProps = SlideRendererProps & {
  content: Extract<SlideContent, { type: "classic" }>;
};

const style = {
  classicSlideContainer: {
    zIndex: 0,
    flex: 1,
  },
  contentContainer: {
    margin: '24px'
  }
};

export const ClassicSlideRenderer: act.Component<ClassicSlideRendererProps> = ({
  slide,
  content,
  gameId,
  assets,
}) => {
  const props = { gameId, slide, assets };
  return h("div", { style: style.classicSlideContainer }, [
    h(BackgroundRenderer, { ...props, background: content.background }),
    h('div', { style: style.contentContainer }, [
      h("h2", {}, content.heading),
      h("p", {}, content.description),
    ]),
  ]);
};