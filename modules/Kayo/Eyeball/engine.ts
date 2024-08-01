import { useState, useMemo, Component, ElementNode } from '@lukekaalim/act';
import { nanoid } from 'nanoid';

declare const idType: unique symbol;
type OpaqueID<T extends string> = string & { [idType]: T };

export const createID = <T extends string>(): OpaqueID<T> => {
  return nanoid() as OpaqueID<T>;
}

export type TooltipEntry = {
  id: OpaqueID<"TooltipID">,
  parentId: null | OpaqueID<"TooltipID">,
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
  dropdowns: DropdownEntry[],
  dialogues: DialogueEntry[],
  tooltips: TooltipEntry[],

  newDialogue: (render: (entry: DialogueEntry) => ElementNode, required?: boolean) => DialogueEntry,
  closeDialogue: (id: OpaqueID<"DialogueID">) => void,
};

export const useEyeballEngine = (): EyeballEngine => {
  const [dropdowns, setDropdowns] = useState<DropdownEntry[]>([]);
  const [dialogues, setDialogues] = useState<DialogueEntry[]>([]);
  const [tooltips, setTooltips] = useState<TooltipEntry[]>([]);

  return {
    dropdowns,
    dialogues,
    tooltips,
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