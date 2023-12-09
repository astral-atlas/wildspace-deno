import { act, actCommon, artifact, journal } from "../deps.ts";
import { Slide, SlideAsset, SlideContent } from "../slide.ts";

import { ClassicSlideRenderer } from './ClassicSlideRenderer.ts';
import { JengaSlideRenderer } from "./JengaSlide.ts";

const { h, useState, useEffect } = act;
const { useAsync, useDisposable } = actCommon;

export type SlideRendererProps = {
  gameId: string;
  slide: Slide;
  assets: artifact.Service;
  gameController: journal.GameController,
};

export const SlideRenderer: act.Component<SlideRendererProps> = ({
  gameId,
  slide,
  assets,
  gameController,
}) => {
  const props = { gameId, slide, assets, gameController };
  switch (slide.content.type) {
    case "classic":
      return h(ClassicSlideRenderer, { ...props, content: slide.content });
    case "title":
      return h(TitleSlideRenderer, { ...props, content: slide.content });
    case 'jenga':
      return h(JengaSlideRenderer, { content: slide.content, gameController });
    default:
      return "Error!";
  }
};

const style = {
  classicSlideContainer: {
    zIndex: 0,
    flex: 1,
  },
  titleSlideContainer: {
    zIndex: 0,
    flex: 1,
    display: "flex",
  },
  title: {
    marginTop: "auto",
    marginBottom: "auto",
    textAlign: 'center',
    width: '100%',
    padding: '32px',
    backgroundColor: `rgba(0, 0, 0, 0.4)`,
    boxShadow: `0 0 8px 0px rgba(0, 0, 0, 0.4)`,
    color: 'white',
    backdropFilter: `blur(2px)`,
  },
  backgroundImage: {
    zIndex: -1,
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundPosition: 'center center',
    backgroundSize: 'cover',
  },
};

export type TitleSlideRendererProps = SlideRendererProps & {
  content: Extract<SlideContent, { type: "title" }>;
};
export const TitleSlideRenderer: act.Component<TitleSlideRendererProps> = ({
  slide,
  content,
  assets,
  gameId,
  gameController,
}) => {
  const props = { gameId, slide, assets, gameController };
  return h("div", { style: style.titleSlideContainer }, [
    h(BackgroundRenderer, { ...props, background: content.background }),
    h("h2", { style: style.title }, content.title),
  ]);
};

export type BackgroundRendererProps = SlideRendererProps & {
  background: SlideAsset;
};

export const BackgroundRenderer: act.Component<BackgroundRendererProps> = ({
  background,
  assets,
  gameId,
}) => {
  if (background.type === "none") return null;

  const blob = useAsync(
    () => assets.downloadAsset(gameId, background.assetId),
    [gameId, background.assetId]
  );

  if (!blob)
    return null;

  const { url } = useDisposable(() => {
    const url = URL.createObjectURL(blob);
    return {
      url,
      dispose: () => URL.revokeObjectURL(url),
    };
  }, [blob])

  return h('div', {
    style: {
      ...style.backgroundImage,
      backgroundImage: `url(${url})`,
    }
  });
};
