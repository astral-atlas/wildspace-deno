import { universe } from "../deps.ts";
import { act, curve, kayo, actCommon, journal } from "../deps.ts";
import { FileContent, FileItem, FileItemID } from "../models.ts";

const { h, useMemo, useState, useEffect, useRef } = act;

export type FileBrowserEvent =
  | { type: 'rename', id: FileItemID, newName: string }
  | { type: 'delete', id: FileItemID }
  | { type: 'create', name: string, content: FileContent, parentId: FileItemID }

export type FileBrowserProps = {
  files: FileItem[],
  rootFile: FileItemID,

  onEvent?: (event: FileBrowserEvent) => unknown,
};

export const FileBrowser: act.Component<FileBrowserProps> = ({
  files,
  rootFile,

  onEvent = _ => {},
}) => {
  const fileMap = useMemo(() => new Map(files.map(f => [f.id, f])), [files]);
  
  const selection = actCommon.useSelection<FileItemID>();
  
  const renderNode = (node: kayo.TreeNode<FileItem>) => {
    const file = node.data;
    const selected = selection.selectedItems.includes(file.id);
    const onSelect = () => {
      selection.select(file.id);
    }
    const onDeselect = () => {
      selection.deselect(file.id);
    }
    const onRename = (newName: string) => {
      onEvent({ type: 'rename', newName, id: file.id })
    }
    return h(FileNodeRenderer, {
      file, onSelect,
      onDeselect, selected,
      onRename, onEvent
    });
  };

  const fileNodeList = files.map(file => {
    if (file.content.type !== 'directory')
      return { id: file.id, children: [], size: { x: 8, y: 1 }, data: file };

    return {
      id: file.id,
      children: file.content.children,
      size: { x: 8, y: 1 },
      data: file,
    }
  })

  const nodes = new Map(fileNodeList.map(node => [node.id, node]));

  return [
    h('pre', {}, fileMap.get(selection.selectedItems[0])?.name || 'No Selection'),
    h(kayo.Tree, { nodes, renderNode, rootNode: rootFile }),
  ];
};

type FileNodeRendererProps = {
  file: FileItem,
  selected: boolean,
  onSelect: () => unknown,
  onDeselect: () => unknown,
  onRename: (newName: string) => unknown,

  onEvent?: (event: FileBrowserEvent) => unknown,
}

const styles = {
  container: {
    padding: '4px',
    display: 'flex',
    height: '100%',
    alignItems: 'center',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  editor: {
    flex: 1,
    marginLeft: '8px',
    display: 'flex',
    minWidth: '0%',
  },
  input: {
    flex: 1,
    minWidth: '0%'
  },
  name: {
    marginLeft: '8px',
    flex: 1,
    userSelect: 'none',
    maxHeight: '100%',
    overflowY: 'auto'
  },
};

const FileNodeRenderer: act.Component<FileNodeRendererProps> = ({
  file, selected, onSelect, onDeselect,
  onRename,
  onEvent
}) => {
  const [selectedAnim, setSelectedAnim] = useState(
    curve.createInitialCubicBezierAnimation(0)
  );
  const [editing, setEditing] = useState(false);

  const [editingName, setEditingName] = useState('');

  const ref = useRef<HTMLElement | null>(null);
  const editorRef = useRef<HTMLInputElement | null>(null);

  curve.useBezierAnimation(selectedAnim, (selected) => {
    const element = ref.current as HTMLElement;
    element.style.backgroundColor = `hsl(220deg, 80%, ${(1 - (selected.position/2.5)) * 100}%)`;
    element.style.color = `hsl(0deg, 0%, ${(selected.position) * 100}%)`;
  });

  useEffect(() => {
    setSelectedAnim(p =>
      curve.interpolateCubicBezierAnimation(p, selected ? 1 : 0, 200, 3, performance.now()));
  }, [selected]);

  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented)
      return;
    if (event.target === editorRef.current)
      return;
    event.preventDefault();
    onSelect();
  };
  const onDblClick = (event: MouseEvent) => {
    if (event.defaultPrevented)
      return;
    if (event.target === editorRef.current)
      return;
    event.preventDefault();
    onSelect();
    setEditing(true);
    setEditingName(file.name);
  }
  const onInput = (event: InputEvent) => {
    setEditingName((event.target as HTMLInputElement).value);
  }
  const onSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    setEditing(false);
    onRename(editingName)
  };
  const props = {
    ref,
    style: styles.container,
    onClick,
    onDblClick,
    //onFocusOut,
    tabIndex: 0,
  };
  const onBlur = () => {
    setEditing(false);
    onRename(editingName)
  }
  useEffect(() => {
    if (editing) {
      editorRef.current?.focus()
      editorRef.current?.select()
    }
  }, [editing])

  return h('div', props, [
    h('input', { type: 'checkbox', checked: selected }),
    editing
      ? h('form', { onSubmit, style: styles.editor }, h('input', {
        type: 'text', value: editingName,
        onBlur, style: styles.input, ref: editorRef,
        onInput
      }))
      : h('span', { style: styles.name }, file.name),
    h(FileActions, { file, onEvent })
  ]);
}

export type FileActionsProps = {
  file: FileItem,

  onEvent?: (event: FileBrowserEvent) => unknown,
};

export const FileActions: act.Component<FileActionsProps> = ({
  file, onEvent = _ => {}
}) => {
  const onClickPlus = (event: MouseEvent) => {
    event.preventDefault()
    onEvent({
      type: 'create',
      content: { type: 'directory', children: [] },
      name: 'New Folder',
      parentId: file.id,
    })
  };
  const onClickMinus = (event: MouseEvent) => {
    event.preventDefault()
    onEvent({
      type: 'delete',
      id: file.id,
    })
  };

  const [dropdownPosition, setDropdownPosition] = useState<kayo.KayoVector2 | null>(null);
  const overlay = kayo.useOverlayRoot()

  const onClickStar = (event: MouseEvent) => {
    const targetRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const overlayRect = overlay.getBoundingClientRect();
    const targetInOverlaySpace = {
      x: (targetRect.x + targetRect.width) - overlayRect.x,
      y: (targetRect.y) - overlayRect.y,
    }
    setDropdownPosition(p => p ? null : targetInOverlaySpace)
  };

  return [
    file.parentId && h('button', { onClick: onClickMinus }, '-'),
    file.content.type === 'directory' &&
      h('button', { onClick: onClickPlus }, '+'),
    file.content.type === 'directory' &&
      h('button', { onClick: onClickStar }, dropdownPosition ? '^' : 'v'),
      dropdownPosition && h(DropdownMenu, { position: dropdownPosition, onEvent, file })
  ]
};

type DropdownMenuProps = {
  file: FileItem,
  position: kayo.KayoVector2,
  onEvent?: (event: FileBrowserEvent) => unknown,
}

const DropdownMenu: act.Component<DropdownMenuProps> = ({ position, onEvent = _ => {}, file }) => {
  const ref = useRef<HTMLElement | null>(null);

  kayo.useOverlayedElement(ref);

  const style = {
    position: 'absolute',
    top: position.y + 'px',
    left: position.x + 'px',
    width: '200px',
    backgroundColor: 'grey',
    border: '1px inset grey',
    display: 'flex',
    flexDirection: 'column',
  }
  const onCreateAssetClick = () => {
    onEvent({
      type: 'create',
      content: {
        type: 'asset',
        assetId: '???'
      },
      name: "New Asset",
      parentId: file.id,
    })
  };

  return h('null', {},
    h('div', { ref, style }, [
      h('button', { onClick: onCreateAssetClick }, 'Create Asset'),
    ]));
}