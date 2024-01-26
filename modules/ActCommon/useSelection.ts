import { act } from "./deps.ts";

const { useState } = act;


export type SelectionMode =
  | 'toggle'
  | 'replace'

export type SelectionManger<T> = {
  selectedItems: T[],
  
  mode: SelectionMode,
  setMode: (mode: SelectionMode) => void,

  select: (item: T) => void,
  deselect: (item: T) => void,
  clear: () => void,
};


export const useSelection = <T>(): SelectionManger<T> => {
  const [selectedItems, setSelectedItems] = useState<T[]>([]);
  const [mode, setMode] = useState<SelectionMode>('replace');

  const select = (item: T) => {
    switch (mode) {
      case 'replace':
        return setSelectedItems([item]);
      case 'toggle': {
        const selected = selectedItems.includes(item);
        if (selected)
          return deselect(item);
        return addItem(item);
      }
    }
  };
  const addItem = (item: T) => {
    setSelectedItems(prevItems => [...prevItems, item])
  }
  const deselect = (item: T) => {
    setSelectedItems(prevItems => prevItems.filter(i => i !== item))
  };
  const clear = () => {
    setSelectedItems([]);
  }

  return {
    selectedItems,

    mode,
    setMode,

    select,
    deselect,
    clear,
  }
};
