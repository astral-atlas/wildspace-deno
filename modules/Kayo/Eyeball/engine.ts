import { useState, useMemo, Component, ElementNode } from '@lukekaalim/act';
import { nanoid } from 'nanoid';
import { Rect } from 'space/rects';
import { Vector } from 'space/vectors';
import { m } from '../../SesameModels/deps';
import { act } from '../deps';

declare const idType: unique symbol;
export type OpaqueID<T extends string> = string & { [idType]: T };

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
  render: (entry: DropdownEntry) => ElementNode
};

export type EyeballEngine = {
  screenspaceElementRef: act.Ref<HTMLElement | null>,
  dropdowns: DropdownEntry[],
  dialogues: DialogueEntry[],

  newDialogue: (render: (entry: DialogueEntry) => ElementNode, required?: boolean) => DialogueEntry,
  closeDialogue: (id: OpaqueID<"DialogueID">) => void,
} & TooltipEngine;

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

export const useEyeballEngine = (): EyeballEngine => {
  const [dropdowns, setDropdowns] = useState<DropdownEntry[]>([]);
  const [dialogues, setDialogues] = useState<DialogueEntry[]>([]);
  
  const tooltipEngine = useTooltipEngine();
  const screenspaceElementRef = act.useRef<HTMLElement | null>(null);

  return {
    screenspaceElementRef,
    ...tooltipEngine,

    dropdowns,
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
};