import { kayo, act, three, actCommon } from "./deps.ts";
// @deno-types="vite-css"
import styles from './SceneTree.module.css';

const { h } = act;

export type SceneTreeProps = {
  root: three.Object3D,

  selection?: actCommon.SelectionManger<three.Object3D>,
}

const buildNodes = (object: three.Object3D): kayo.TreeNode<three.Object3D>[] => {
  const node: kayo.TreeNode<three.Object3D> = {
    id: object.id,
    children: object.children.map(c => c.id),
    size: { x: 4, y: 1 },
    data: object,
  };
  return [node, ...object.children.flatMap(buildNodes)]
};

export const SceneTree: act.Component<SceneTreeProps> = ({ root, selection }) => {
  
  const nodes = new Map<kayo.TreeNodeID, kayo.TreeNode<three.Object3D>>(
    buildNodes(root)
      .map(n => [n.id, n])
  )

  const renderNode = (node: kayo.TreeNode<three.Object3D>) => {
    const selected = selection && selection.selectedItems.includes(node.data);
    const onClick = () => {
      selection && selection.select(node.data);
    };
    return h('button', { onClick, classList: [styles.node, selected && styles.selected] }, node.data.name || 'Node');
  }

  return h(kayo.Tree, { nodes, rootNode: root.id, renderNode })
};