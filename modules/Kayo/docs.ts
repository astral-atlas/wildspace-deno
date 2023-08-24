import { FillBlock } from "../ComponentDoc/Blocks.ts";
import { FramePresenter } from "../ComponentDoc/FramePresenter.ts";
import { markdownToSheet } from "../ComponentDoc/markdown.ts";
import { CenterLayout } from "./CenterLayout.ts";
import { act } from "./deps.ts";
// @deno-types="vite-text"
import readme from './readme.md?raw';

const { h } = act;

const demos = {
  centerLayout() {
    return h(FramePresenter, {}, [
      h(CenterLayout, {}, [
        h(FillBlock, { style: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'flex-start'
        }, labelStyle: { marginTop: `24px`, marginLeft: '24px' } }, 'Background'),
        h(FillBlock, { style: {
          width: `100px`,
          height: `100px`,
          overflow: 'hidden',
          resize: 'both',
          border: '1px solid black',
        } }, 'Centered Content'),
    ])
    ]);
  }
};

export const kayoDocs = [
  markdownToSheet('Kayo', readme, demos)
]