import { act } from "../deps.ts";
import { KayoRect, KayoLine, KayoVector2 } from "./rect.ts";
const { h } = act;

export type TreeNodeID = number;
export type TreeNode = {
  id: TreeNodeID;
  children: TreeNodeID[];
  size: KayoVector2,
};
export type TreeNodeLayout = {
  /**Where in layoutspace you are located */
  content: KayoRect,
  /**Distance from yourself to your parent */
  parentOffset: null | KayoLine,
}

export type TreeProps = {
  nodes: Map<TreeNodeID, TreeNode>;
};

export type TreeOutput = {
  nodeRects: Map<TreeNodeID, KayoRect>,
  nodeBoundaryRects: Map<TreeNodeID, KayoRect>,
  nodeLines: Map<TreeNodeID, KayoLine[]>,
}

/** Given a set of nodes, draw out all the children of a provided node in a vector */
export const calculateTreeLayout = (
  nodes: Map<TreeNodeID, TreeNode>,

  output: TreeOutput,

  nodeId: TreeNodeID,
  startPosition: KayoVector2
): KayoRect => {
  const node = nodes.get(nodeId) as TreeNode;
  const rect = {
    position: startPosition,
    size: { x: 1, y: 1 },
  };
  output.nodeRects.set(nodeId, rect);
  let maxChildWidth = 0;
  const childStarts: KayoVector2[] = [];
  let childStartPosition = {
    x: startPosition.x + 1,
    y: startPosition.y + 1,
  };
  for (const child of node.children) {
    childStarts.push({ ...childStartPosition });
    calculateTreeLayout(
      nodes,
      output,
      child,
      childStartPosition
    );
    const childRect = output.nodeRects.get(child) as KayoRect;
    maxChildWidth = Math.max(maxChildWidth, childRect.size.x);
    childStartPosition = {
      x: startPosition.x + 1,
      y: childRect.position.y + childRect.size.y,
    }
  }
  const lastChild = childStarts[childStarts.length - 1];
  output.nodeLines.set(nodeId, [
    lastChild && {
      start: { x: startPosition.x + 0.5, y: startPosition.y + 1 },
      end: { x: startPosition.x + 0.5, y: lastChild.y + 0.5 },
    },
    ...childStarts.map(childStart => {
      return {
        start: {
          x: childStart.x - 0.5,
          y: childStart.y + 0.5,
        },
        end: {
          x: childStart.x,
          y: childStart.y + 0.5
        }
      }
    })
  ].filter((x): x is KayoLine => !!x));
  return {
    position: { ...startPosition },
    size: {
      x: maxChildWidth + 1,
      y: childStartPosition.y - startPosition.y,
    }
  };
};

export const Tree: act.Component<TreeProps> = ({ nodes }) => {
  return h("div", {}, [
    [...nodes.values()].map((node) => {
      return h(TreeNodeRenderer);
    }),
  ]);
};

export type TreeNodeRendererProps = {};

export const TreeNodeRenderer: act.Component<TreeNodeRendererProps> = () => {
  return null;
};
