import { refCount } from "https://esm.sh/rxjs@7.8.1";
import { act, curve } from "../deps.ts";
import { createTransitionHook } from "./array.ts";
import { KayoRect, KayoVector2 } from "./rect.ts";
import { useMemo } from "https://esm.sh/@lukekaalim/act@2.6.0";
const { h, useRef } = act;

export type TreeNodeID = number | string;
export type TreeNode<T> = {
  id: TreeNodeID;
  children: ReadonlyArray<TreeNodeID>;
  size: KayoVector2,
  data: T,
};
export type TreeNodeLayout<T> = {
  /**What node this layout refers to */
  node: TreeNode<T>,
  /**Where in layoutspace you are located */
  content: KayoRect,
  /**Where your parent is located */
  parentPosition: null | KayoVector2,
}

/** Given a set of nodes, draw out all the children of a provided node in a vector */
export const placeTreeNode = <T>(
  nodes: Map<TreeNodeID, TreeNode<T>>,
  layouts: Map<TreeNodeID, TreeNodeLayout<T>>,

  nodeId: TreeNodeID,
  parentPosition: null | KayoVector2,
  startPosition: KayoVector2
): KayoRect => {
  const node = nodes.get(nodeId);
  if (!node)
    return { size: { x: 0, y: 0 }, position: startPosition };

  const layout: TreeNodeLayout<T> = {
    node,
    content: {
      position: startPosition,
      size: { x: node.size.x, y: node.size.y },
    },
    parentPosition
  };
  layouts.set(nodeId, layout);

  let childStartY = startPosition.y + node.size.y;
  const childStartX = startPosition.x + 1;

  const childRects: KayoRect[] = [];

  for (const child of node.children) {
    const childStartPosition = { x: childStartX, y: childStartY };
    const childRect = placeTreeNode(nodes, layouts, child, startPosition, childStartPosition);
    childStartY += childRect.size.y;
    childRects.push(childRect);
  };

  const containerRect = {
    position: startPosition,
    size: {
      x: Math.max(childRects.reduce((acc, curr) => Math.max(curr.size.x, acc), 0) + 1, node.size.x),
      y: childRects.reduce((acc, curr) => curr.size.y + acc, 0) + node.size.y,
    }
  }

  return containerRect;
};

export type TreeProps = {
  nodes: Map<TreeNodeID, TreeNode<any>>;
  rootNode: TreeNodeID,
  renderNode: (node: TreeNode<any>) => act.ElementNode,
};
type TransitionState<T> = {
  id: number,
  layout: TreeNodeLayout<T>,
  opacity: curve.CubicBezierAnimation,
  offset: curve.CubicBezierAnimation,
};

const useTreeNodeLayoutTransition = createTransitionHook<TreeNodeLayout<unknown>, TreeNodeID, TransitionState<unknown>>({
  calculateKey: layout => layout.node.id,
  createState: (layout) => ({
    layout,
    id: Math.random(),
    opacity: curve.interpolateCubicBezierAnimation(
      curve.createInitialCubicBezierAnimation(0),
      1, 200, 3, performance.now(),
    ),
    offset: curve.interpolateCubicBezierAnimation(
      curve.createInitialCubicBezierAnimation(-2),
      0, 200, 6, performance.now(),
    ),
  }),
  updateState: (state, layout) => ({ ...state, layout }),
  moveState: (state, _, layout) => ({ ...state, layout }),
  removeState: (state) => (console.log('Removing', state), {
    ...state,
    opacity: curve.interpolateCubicBezierAnimation(
      state.opacity,
      0, 200, 3, performance.now(),
    ),
    offset: curve.interpolateCubicBezierAnimation(
      state.offset,
      1, 200, 3, performance.now(),
    ),
  }),
  stateFilter: state => {
    return (state.opacity.span.start + state.opacity.span.durationMs) > performance.now();
  }
});

export const Tree: act.Component<TreeProps> = ({ nodes, rootNode, renderNode }) => {
  const layouts = new Map<TreeNodeID, TreeNodeLayout<unknown>>();
  const bounds = placeTreeNode(nodes, layouts, rootNode, null, { x: 0, y: 0 })

  const style = {
    height: (bounds.size.y * 32) + 'px',
    width: (bounds.size.x * 32) + 'px',
    position: 'relative',
  }

  const initial = useMemo(() => [...layouts.values()].map(layout => {
    return [layout.node.id, {
      layout,
      id: Math.random(),
      opacity: curve.createInitialCubicBezierAnimation(1),
      offset: curve.createInitialCubicBezierAnimation(0)
    }] as [TreeNodeID, TransitionState<unknown>];
  }), []);

  const layoutTransitions = useTreeNodeLayoutTransition([...layouts.values()], initial);

  return [
    h("div", { style }, [
      h('div', {}, [
        layoutTransitions.map((transition) => {
          return h(TreeNodeRenderer, { transition }, [
            renderNode(transition.layout.node)
          ]);
        }),
      ]),
      h('svg', { width: (bounds.size.x * 32) + 'px', height: (bounds.size.y * 32) + 'px' }, [
        layoutTransitions.map(transition => h(TreeLineRenderer, { transition, key: transition.id })),
      ]),
    ]),
    //h('pre', {}, JSON.stringify(layoutTransitions.length, null, 2))
  ];
};

export type TreeNodeRendererProps = {
  transition: TransitionState<unknown>,
};

export const TreeNodeRenderer: act.Component<TreeNodeRendererProps> = ({
  transition,
  children
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  curve.useBezierAnimation(transition.opacity, ({ position }) => {
    if (ref.current) {
      ref.current.style.opacity = String(position);
    }
  });
  curve.useBezierAnimation(transition.offset, ({ position }) => {
    if (ref.current) {
      const x = (layout.content.position.x + position) * 32;
      const y = layout.content.position.y * 32;

      ref.current.style.transform = `translate(${x}px, ${y}px)`;
    }
  });

  const { layout } = transition;
  const style = {
    position: 'absolute',
    height: `${layout.content.size.y * 32}px`,
    width: `${layout.content.size.x * 32}px`,
  }
  return h('div', { style, ref }, children);
};

export const TreeLineRenderer: act.Component<TreeNodeRendererProps> = ({ transition }) => {
  const { layout } = transition;

  if (!layout.parentPosition)
    return null;
  const ref = useRef<SVGPathElement | null>(null)

  const pPos = layout.parentPosition;
  const cPos = layout.content.position;

  curve.useBezierAnimation(transition.opacity, ({ position }) => {
    if (ref.current) {
      ref.current.style.opacity = String(position);
    }
  });

  const commands = [
    `M${(pPos.x + 0.5) * 32} ${(pPos.y + 0.5) * 32}`,
    `L${(pPos.x + 0.5) * 32} ${(cPos.y + 0.5) * 32}`,
    `L${(cPos.x + 0.5) * 32} ${(cPos.y + 0.5) * 32}`
  ];

  return h('path', {
    d: commands.join(''),
    fill: "transparent",
    stroke: "black",
    'stroke-width': '2px',
    ref,
  });
}