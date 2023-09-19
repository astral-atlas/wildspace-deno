import { FillBlock, FixedBlock, FlexBlock } from "../ComponentDoc/Blocks.ts";
import { FramePresenter } from "../ComponentDoc/FramePresenter.ts";
import { markdownToSheet } from "../ComponentDoc/markdown.ts";
import { CenterLayout } from "./CenterLayout.ts";
import { FixedToolbar, ToolbarLayout } from "./ToolbarLayout.ts";
import { act } from "./deps.ts";
// @deno-types="vite-text"
import readme from './readme.md?raw';

const { h, useState } = act;

const demos = {
  toolbarLayout() {
    const [items, setItems] = useState(4);
    const [direction, setDirection] = useState<"up" | "left" | "right" | "down">('up');
    const onInput = (e: Event) => {
      const i = e.target as HTMLInputElement
      setItems(i.valueAsNumber);
    }
    const onDirectionInput = (e: Event) => {
      const i = e.target as HTMLSelectElement
      setDirection(i.value as "up" | "left" | "right" | "down");
    }
    const toolbarChildren = Array.from({ length: items })
      .map((_, i) => h(FixedBlock, { height: 20, width: 20 }, i))
    return [
      h('select', { onInput: onDirectionInput }, [
        h('option', {}, 'up'),
        h('option', {}, 'down'),
        h('option', {}, 'left'),
        h('option', {}, 'right'),
      ]),
      h('input', { type: 'range', value: items, onInput, min: 0, max: 60 }),
      h(FramePresenter, {}, [
        h(ToolbarLayout, { toolbarChildren, direction },
          h(FillBlock)),
      ]),
    ]
  },
  fixedToolbar() {
    const [direction, setDirection] = useState<"up" | "left" | "right" | "down">('up');

    const onDirectionInput = (e: Event) => {
      const i = e.target as HTMLSelectElement
      setDirection(i.value as "up" | "left" | "right" | "down");
    }
    return [
      h('select', { onInput: onDirectionInput }, [
        h('option', {}, 'up'),
        h('option', {}, 'down'),
        h('option', {}, 'left'),
        h('option', {}, 'right'),
      ]),
      h(FramePresenter, {}, [
        h(FixedToolbar, {
          direction
        },
          [h(FlexBlock, {  }, 'Toolbar'), h(FixedBlock, { height: 20, width: 20 }, 0), h(FixedBlock, { height: 20, width: 20 }, 1)]),
      ])
    ];
  },
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