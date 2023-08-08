// @flow strict

import { h, Component } from "https://esm.sh/@lukekaalim/act@2.6.0";

// @deno-types="vite-css" 
import styles from './FramePresenter.module.css';
import { randomSoftColor } from "../RandomThingGenerator/random.ts";

export type FramePresenterProps = {
  height?: string,
  padding?: string,
  backgroundColor?: string,
};

export const FramePresenter: Component<FramePresenterProps> = ({
  children,
  //style,
  height = '512px',
  padding = '0px',
  backgroundColor = randomSoftColor()
}) => {
  return [
    h('div', { class: styles.framePresenterContainer, style: {
      height, 
      backgroundColor
    } }, [
      h('div', { class: styles.framePresenterContent, style: {
        position: 'relative',
        width: '100%', height: '100%',
        maxWidth: '100%', maxHeight: '100%',
        boxSizing: 'border-box',
        resize: 'both', overflow: 'hidden',
        padding,
      } }, children),
    ]),
  ]
}


export type ScalableFramePresenterProps = {

};


export const ScalableFramePresenter: Component<ScalableFramePresenterProps> = ({ children, style, height }) => {
  const [scale, setScale] = useState(1);
  const ref = useRef();
  const onSetFullscreen = () => {
    const { current: element } = ref;
    if (element instanceof HTMLElement)
      element.requestFullscreen();
  }
  return [
    h(LayoutDemo, { style, height }, [
      h('div', { ref, style: {
        ...style,
        backgroundColor: 'white',
        transformOrigin: '0 0',
        transform: `scale(${scale})`,
        width: `${100/scale}%`,
        height: `${100/scale}%`,
      } }, children)
    ]),
    h('div', { style: { backgroundColor: '#e8e8e8' } }, [
      h(EditorForm, {}, [
        h(EditorHorizontalSection, {}, [
          h(EditorButton, { label: 'Fullscreen', onButtonClick: onSetFullscreen }),
          h(EditorRangeInput, {
            label: 'Scale', min: 0.1,
            step: 0.001,
            max: 1, number: scale,
            onNumberInput: scale => setScale(scale) })
        ]),
      ])
    ])
  ]
}