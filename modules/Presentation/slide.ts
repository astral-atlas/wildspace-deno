import { artifact, m } from "./deps.ts";

export const imageSlideAssetDef = m.object({  
  type: m.literal('image'),
  assetId: artifact.assetIdDefinition,
});
export const noneSlideAssetDef = m.object({
  type: m.literal('none')
});

export const slideAssetDef = m.union2([
  imageSlideAssetDef,
  noneSlideAssetDef,
] as const);
export type SlideAsset = m.OfModelType<typeof slideAssetDef>;

export const classicSlideContendDef = m.object({
  type: m.literal('classic'),
  heading: m.string,
  description: m.string,
  background: slideAssetDef,
})
export const captionSlideContentDef = m.object({
  type: m.literal('caption'),
  heading: m.string,
  description: m.string,
  background: slideAssetDef,
})
export const titleSlideContendDef = m.object({
  type: m.literal('title'),
  title: m.string,
  background: slideAssetDef,
})

export const slideContentDef = m.union2([
  classicSlideContendDef,
  titleSlideContendDef,
  captionSlideContentDef,
] as const);
export type SlideContent = m.OfModelType<typeof slideContentDef>;

export const slideDef = m.object({
  id: m.string,
  gameId: m.string,

  name: m.string,
  content: slideContentDef,
});

export type Slide = m.OfModelType<typeof slideDef>;
