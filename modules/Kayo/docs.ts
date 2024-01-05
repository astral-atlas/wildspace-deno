import { FillBlock, FixedBlock, FlexBlock } from "../ComponentDoc/Blocks.ts";
import { FramePresenter } from "../ComponentDoc/FramePresenter.ts";
import { markdownToSheet } from "../ComponentDoc/markdown.ts";
import { CenterLayout } from "./CenterLayout.ts";
import { GridPattern } from "./GridPattern.ts";
import { FixedToolbar, ToolbarLayout } from "./ToolbarLayout.ts";
import { computeTreeOutput, TreeNodeID, TreeNode, KayoRect, KayoLine } from "./Tree.ts";
import { act, curve, desk } from "./deps.ts";
// @deno-types="vite-text"
import readme from './readme.md?raw';

const { h, useState, useRef, useEffect } = act;
const { useDraggableSurface2 } = desk;

export const treeLayout: act.Component = () => {
  const [hidden, setHidden] = useState(new Set());

  const nodes = new Map<TreeNodeID, TreeNode>([
    { id: 0, children: [1, 2, 3] },
    { id: 1, children: [] },
    { id: 2, children: [4, 5] },
    { id: 3, children: [] },

    { id: 4, children: [] },
    { id: 5, children: [6] },

    { id: 6, children: [] },
  ]
    .filter((x): x is TreeNode => !!x)
    .map(x => hidden.has(x.id) ? { ...x, children: [] } : x)
    .map(n => [n.id, n]));

  const nodeRects = new Map<TreeNodeID, KayoRect>();
  const nodeBoundaryRects = new Map<TreeNodeID, KayoRect>();
  const nodeLines = new Map<TreeNodeID, KayoLine[]>();

  const output = {
    nodeRects,
    nodeBoundaryRects,
    nodeLines
  }

  computeTreeOutput(nodes, output, 0, { x: 0, y: 0 });

  const id = act.useMemo(() => (Math.random() * 10000).toString());
  const size = 20;
  const ref = useRef<SVGSVGElement | null>(null);
  const groupRef = useRef<SVGGElement | null>(null);
  const patternRef = useRef<SVGPatternElement | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null);

  const drag = useDraggableSurface2(ref, []);
  const position = useRef({ x: 10, y: 10 }).current;

  useEffect(() => {
    const g = groupRef.current;
    const p = patternRef.current;
    const d = divRef.current;
    if (!g || !p || !d)
      return;
    const onDragSub = drag.onDragStart.subscribe((movement) => {
      movement.changes.subscribe((change) => {
        if (change.type === 'end')
          return;
        position.x += change.change.x;
        position.y += change.change.y;
        g.style.transform = `translate(${position.x}px, ${position.y}px)`;
        d.style.transform = `translate(${position.x}px, ${position.y}px)`;
        p.setAttribute('x', position.x + 'px');
        p.setAttribute('y', position.y + 'px');
      });
    });
    g.style.transform = `translate(${position.x}px, ${position.y}px)`;
    d.style.transform = `translate(${position.x}px, ${position.y}px)`;
    p.setAttribute('x', position.x + 'px');
    p.setAttribute('y', position.y + 'px');
    return () => onDragSub.unsubscribe();
  }, []);

  const nodeRectList = act.useMemo(() =>
    [...nodeRects], [nodeRects])
  const nodeLineList = act.useMemo(() =>
    [...nodeLines].map(([key, line]) =>
      line.map((l, i) => ({ ...l, key: [key, i].join(':') }))).flat(1), [nodeLines])

  const animatedRectList = curve.useAnimatedList2(nodeRectList, {
    calculateKey: ([id]) => id.toString(),
  });
  const animatedLineList = curve.useAnimatedList2(nodeLineList, {
    calculateKey: (line) => line.key.toString(),
    
  });
  const onToggleHide = (nodeId: number) => () => {
    const next = new Set(hidden)
    if (hidden.has(nodeId)) {
      next.delete(nodeId)
    } else {
      next.add(nodeId)
    }
    setHidden(next);
  };

  return [
    h('div', { style: { width: '100%', height: '400px', position: 'relative' } }, [
      h('svg', { style: { border: '1px solid black', height: '100%', width: '100%' }, ref }, [
        h('defs', {}, [
          h(GridPattern, { id, size, ref: patternRef }),
        ]),
        h('rect', { width: '100%', height: '100%', fill: `url(#${id})` }),
        h('g', { style: { transform: `translate(${position.x}px, ${position.y})` }, ref: groupRef }, [
          animatedLineList.map(({ value: { key, ...line }, state }) => {
            return h(MovingLine, {
              state,
              key: key.toString(),
              size,
              line,
            })
          })
        ]),
      ]),
      h('div', { ref: divRef, style: { position: 'absolute', top: 0, left: 0 } }, [
        animatedRectList.map(({ key, value: [nodeId, rect], state }) => {
          return h(MovingRect, {
            onClick: onToggleHide(nodeId),
            state,
            key,
            size,
            rect,
            fill: `hsl(${(nodeId * 16)}deg, 100%, 50%)`,
          }, hidden.has(nodeId) ? 'Show' : 'Hide')
        }),
      ])
    ]),
  ]
}

const useSimpleAnimation = (setAttribute: (pos: number) => unknown, value: number) => {
  const [valueCurve, setValueCurve] = useState(curve.createInitialCubicBezierAnimation(value));
  useEffect(() => {
    setValueCurve(prev =>
      curve.interpolateCubicBezierAnimation(prev, value, 300, 0, performance.now())
    )
  }, [value]);
  curve.useBezierAnimation(valueCurve, (point) => {
    setAttribute(point.position)
  })
}

const MovingRect: act.Component<{
  rect: KayoRect,
  size: number,
  fill: string,
  key: string,
  state: curve.CubicBezierAnimation,
  onClick: () => unknown,
}> = ({ rect, size, fill, state, onClick, children }) => {
  const ref = useRef<SVGRectElement | null>(null)
  useSimpleAnimation((position) => {
    if (!ref.current)
      return;
    ref.current.style.left = position * size + "px";
  }, rect.position.x);
  useSimpleAnimation((position) => {
    if (!ref.current)
      return;
    ref.current.style.top = position * size + "px";
  }, rect.position.y);
  curve.useBezierAnimation(state, (point) => {
    if (!ref.current)
      return;
    ref.current.style.opacity = (1 - Math.abs(point.position)).toString();
  });

  return [
    h('button', {
      ref,
      onClick,
      style: {
        position: 'absolute'
      },
      width: rect.size.x * size + 'px',
      height: rect.size.y * size + 'px',
      fill,
    }, children)
  ];
};
const MovingLine: act.Component<{
  line: KayoLine, size: number, key: string,
  state: curve.CubicBezierAnimation,
}> = ({ line, size, state }) => {
  const ref = useRef<SVGLineElement | null>(null)
  
  useSimpleAnimation((position) => {
    if (!ref.current)
      return;
    ref.current.setAttribute('x1', position * size + "px");
  }, line.start.x);
  useSimpleAnimation((position) => {
    if (!ref.current)
      return;
    ref.current.setAttribute('y1', position * size + "px");
  }, line.start.y);
  useSimpleAnimation((position) => {
    if (!ref.current)
      return;
    ref.current.setAttribute('x2', position * size + "px");
  }, line.end.x);
  useSimpleAnimation((position) => {
    if (!ref.current)
      return;
    ref.current.setAttribute('y2', position * size + "px");
  }, line.end.y);
  curve.useBezierAnimation(state, (point) => {
    if (!ref.current)
      return;
    ref.current.style.opacity = (1 - Math.abs(point.position)).toString();
  });

  return h('line', {
    ref,
    'stroke': 'black',
    'stroke-width': '1px',
  })
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