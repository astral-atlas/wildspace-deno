import { artifact, m } from "./deps.ts";

export const jengaVector = m.object({
  x: m.number,
  y: m.number,
})
export type JengaVector = m.OfModelType<typeof jengaVector>;
export const jengaRect = m.object({
  size: jengaVector,
  position: jengaVector,
})
export type JengaRect = m.OfModelType<typeof jengaRect>;

export const jengaBlock = m.object({
  styles: m.object({
    backgroundColor: m.string,
    borderColor: m.string,
    borderRadius: m.number,
    textColor: m.string,
    fontFamily: m.string,
    fontSize: m.number,
    fontWeight: m.string,

    shadow: m.union2([m.literal('none'), m.object({
      color: m.string,
      offset: jengaVector,
      blurStrength: m.number,
    })]),
    backgroundBlur: m.union2([m.literal('none'), m.object({
      strength: m.number,
    })]),
  }),
  textContent: m.string,
  imageContent: m.union2([m.literal('none'), m.object({ assetId: artifact.assetIdDefinition })]),
  rect: jengaRect,
});
export type JengaBlock = m.OfModelType<typeof jengaBlock>;

export const jengaSlideContentDef = m.object({
  type: m.literal('jenga'),
  blocks: m.array(jengaBlock)
})
export type JengaSlideContent = m.OfModelType<typeof jengaSlideContentDef>;