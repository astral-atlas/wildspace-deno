import { FillBlock, FixedBlock, FlexBlock } from "../ComponentDoc/Blocks.ts";
import { FramePresenter } from "../ComponentDoc/FramePresenter.ts";
import { markdownToSheet } from "../ComponentDoc/markdown.ts";
import { CenterLayout } from "./CenterLayout.ts";
import { GridPattern } from "./GridPattern.ts";
import { FixedToolbar, ToolbarLayout } from "./ToolbarLayout.ts";
import { } from "./instinct/mod.ts";
import { act, curve, desk } from "./deps.ts";
// @deno-types="vite-text"
import readme from './readme.md?raw';
import { Tree } from "./instinct/Tree.ts";
import { TreeNode } from "./mod.ts";

const { h, useState, useRef, useEffect } = act;
const { useDraggableSurface2 } = desk;

export const treeLayout: act.Component = () => {
  const [hidden, setHidden] = useState(new Set<number>());

  const allNodes = [
    { id: 0, children: [1,2,3], size: { x: 3, y: 1 }, data: null },
    { id: 1, children: [],      size: { x: 1, y: 1 }, data: null },
    { id: 2, children: [4, 5],  size: { x: 1, y: 2 }, data: null },
    { id: 3, children: [],      size: { x: 1, y: 1 }, data: null },

    { id: 4, children: [], size: { x: 2, y: 2 }, data: null },
    { id: 5, children: [], size: { x: 1, y: 1 }, data: null },
  ];
  const visibleNodes = allNodes.map(n => hidden.has(n.id) ? { ...n, children: [] } : n );

  const nodes = new Map(visibleNodes.map(n => [n.id, n]));
  
  const rootNode = 0;
  const renderNode = (node: TreeNode<null>) => {
    const onClick = () => {
      if (hidden.has(node.id as number)) {
        setHidden(new Set([...hidden].filter(h => h !== node.id)))
      } else {
        setHidden(new Set([...hidden, node.id as number]))
      }
    };
    return h('button', { style: { height: '100%', width: '100%' }, onClick }, node.id)
  }

  return h(Tree, { nodes, rootNode, renderNode });
}

const demos = {
  treeLayout,
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
          direction,
          toolbarChildren: null,
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