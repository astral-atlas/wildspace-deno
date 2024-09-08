import { useState, useMemo, Component, ElementNode } from '@lukekaalim/act';
import { nanoid } from 'nanoid';
import { rect, Rect, rect2 } from 'space/rects';
import { vec, vec2, Vector } from 'space/vectors';
import { m } from '../../SesameModels/deps';
import { act } from '../deps';
import { OpaqueID } from 'ts-common';

export const createID = <T extends string>(): OpaqueID<T> => {
  return nanoid() as OpaqueID<T>;
}

export type TooltipEntry = {
  id: OpaqueID<"TooltipID">,
  parentId: null | OpaqueID<"TooltipID">,
  anchorElement: HTMLElement,
  
  render: (entry: TooltipEntry) => ElementNode
};

export type DialogueEntry = {
  id: OpaqueID<"DialogueID">,
  required: boolean,
  render: (entry: DialogueEntry) => ElementNode
};

export type DropdownEntry = {
  id: OpaqueID<"DropdownID">,
  /** A dropdown is placed in "socket space" rather than element space */
  placementRect: Rect<2>,
  render: (entry: DropdownEntry) => ElementNode
};

export type EyeballEngine = {
  screenspaceElementRef: act.Ref<HTMLElement | null>,
  dialogues: DialogueEntry[],

  pointerPositionRef: act.Ref<Vector<2>>,

  screenSpaceRect: Rect<2>,

  newDialogue: (render: (entry: DialogueEntry) => ElementNode, required?: boolean) => DialogueEntry,
  closeDialogue: (id: OpaqueID<"DialogueID">) => void,
} & TooltipEngine & DropdownEngine;

export type TooltipEngine = {
  tooltips: TooltipEntry[],

  newTooltip: (
    render: (entry: TooltipEntry) => ElementNode,
    anchorElement: HTMLElement,
    parentId?: OpaqueID<"TooltipID"> | null
  ) => TooltipEntry,
  closeTooltip: (id: OpaqueID<"TooltipID">) => void,
}

const useTooltipEngine = (): TooltipEngine => {
  const [tooltips, setTooltips] = useState<TooltipEntry[]>([]);

  return {
    tooltips,
    newTooltip(render, anchorElement, parentId = null) {
      const entry = {
        render,
        parentId,
        anchorElement,
        id: createID<"TooltipID">(),
      }
      const onMouseLeave = () => {
        setTooltips(prev => prev.filter(d => d.id !== entry.id));
        anchorElement.removeEventListener('mouseleave', onMouseLeave)
      }
      anchorElement.addEventListener('mouseleave', onMouseLeave)
      setTooltips(prev => [...prev, entry]);
      return entry;
    },
    closeTooltip(id) {
      setTooltips(tooltips.filter(d => d.id !== id));
    },
  }
}

export type DropdownEngine = {
  dropdowns: DropdownEntry[],

  newDropdown: (
    render: (entry: DropdownEntry) => ElementNode,
    position: Rect<2>
  ) => DropdownEntry,
  replaceDropdown: (
    render: (entry: DropdownEntry) => ElementNode,
    position: Rect<2>
  ) => DropdownEntry
  closeDropdown: (id: OpaqueID<"DropdownID">) => void,
  clearDropdowns: () => void,
}
export const useDropdownEngine = (): DropdownEngine => {
  const [dropdowns, setDropdowns] = useState<DropdownEntry[]>([]);

  return {
    dropdowns,
    newDropdown(render, placementRect) {
      const entry = {
        render,
        placementRect,
        id: createID<"DropdownID">(),
      }
      setDropdowns(d => [...d, entry]);

      return entry;
    },
    replaceDropdown(render, placementRect) {
      const entry = {
        render,
        placementRect,
        id: createID<"DropdownID">(),
      }
      setDropdowns([entry]);

      return entry;
    },
    closeDropdown(id) {
      
    },
    clearDropdowns() {
      setDropdowns([]);
    }
  }
};

export const useEyeballEngine = (): [act.Ref<HTMLElement | null>, null | EyeballEngine] => {
  const [dialogues, setDialogues] = useState<DialogueEntry[]>([]);

  const [screenSpaceRect, setScreenSpaceRect] = useState<null | Rect<2>>(null);
  
  const tooltipEngine = useTooltipEngine();
  const dropdownEngine = useDropdownEngine();
  const screenspaceElementRef = act.useRef<HTMLElement | null>(null);
  const pointerPositionRef = act.useRef<Vector<2>>(vec2(0, 0));

  act.useEffect(() => {
    const { current: screenscpaceElement } = screenspaceElementRef;
    if (!screenscpaceElement)
      return;
    const domRect = screenscpaceElement.getBoundingClientRect();
    setScreenSpaceRect(rect.new2(vec.new2(0, 0), vec.new2(domRect.width, domRect.height)));
  }, [])

  if (!screenSpaceRect)
    return [screenspaceElementRef, null];

  const engine: EyeballEngine = {
    screenSpaceRect,

    screenspaceElementRef,
    pointerPositionRef,
    ...tooltipEngine,
    ...dropdownEngine,

    dialogues,
    newDialogue(render, required = false) {
      const entry = {
        render,
        id: createID<"DialogueID">(),
        required,
      }
      setDialogues([...dialogues, entry]);
      return entry;
    },
    closeDialogue(id) {
      setDialogues(dialogues.filter(d => d.id !== id));
    },
  }

  return [screenspaceElementRef, engine];
};

export const getScreenspaceRect = (engine: EyeballEngine, domElement: HTMLElement) => {
  if (!engine.screenspaceElementRef.current)
    return null;
  const ssBoundaryDomRect = engine.screenspaceElementRef.current.getBoundingClientRect();
  const elementBoundaryDomRect = domElement.getBoundingClientRect();

  return rect2(
    vec2(elementBoundaryDomRect.left - ssBoundaryDomRect.left, elementBoundaryDomRect.top - ssBoundaryDomRect.top),
    vec2(elementBoundaryDomRect.width, elementBoundaryDomRect.height)
  )
}