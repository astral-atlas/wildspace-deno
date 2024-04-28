import { actCommon as ac, three } from "../deps.ts";
import { act, kayo, formula } from "../deps.ts";
import { CrystalBall } from '../CrystalBall.ts';

const { h, useState, useEffect, useRef } = act;

export const ImageWizard: act.Component<{ content: Blob }> = ({ content }) => {
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const url = ac.useBlobURL(content);


  const onLoad = (event: Event) => {
    setImage(event.target as HTMLImageElement);
  }

  return h(kayo.HorizontalFrame, {}, [
    h('div', { style: { display: 'flex', flex: 1, minWidth: '0%' } }, [
      h('img', {
        onLoad,
        ref: imageRef,
        src: url.href,
        style: { height: '300px', width: 'max-content', margin: 'auto', boxShadow: '0 0 8px black' }
      })
    ]),
    h(CrystalBall, { type: 'image' }, image && [
      h(formula.NumberEditor, {
        label: { name: 'Image Bytes', type: 'Bytes' },
        value: content.size,
        disabled: true,
      }),
      h(formula.Vector2Editor, {
        label: { name: 'Image Dimensions' },
        disabled: true,
        value: new three.Vector2(image.naturalWidth, image.naturalHeight),
      }),
    ])
  ]);
}