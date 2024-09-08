import { rect, Rect, Vec, vec } from 'space';
import { ids, OpaqueID } from 'ts-common';
import { act } from '../../deps';
import { EyeballCore } from './core';

export type DropdownEntry = {
  id: OpaqueID<"Dropdown">,
  target: null | Rect<2>,
  placement: null | Rect<2>,
  content: act.ElementNode,
};

export type EyeballDropdown = {
  dropdowns: DropdownEntry[],

  add(target: null | Rect<2>, content: act.ElementNode): DropdownEntry,
  place(id: OpaqueID<"Dropdown">, placement: Rect<2>): void,
  remove(id: OpaqueID<"Dropdown">): void,
  clear(): void,

  render(): act.ElementNode,
};

export const useDropdownEngine = (core: EyeballCore): EyeballDropdown => {
  const [dropdowns, setDropdowns] = act.useState<DropdownEntry[]>([]);

  const dropdownEngine: EyeballDropdown = {
    dropdowns,
    add(target, content) {
      const id = ids.new<"Dropdown">();
      const entry = {
        id,
        target,
        placement: null,
        content
      }
      setDropdowns(ds => [...ds, entry]);
      return entry;
    },
    remove(id) {
      setDropdowns(ds => ds.filter(d => d.id !== id));
    },
    place(id, placement) {
      setDropdowns(ds => ds.map(d => d.id === id ? { ...d, placement } : d));
    },
    clear() {
      setDropdowns([])
    },
    render() {
      return dropdowns.map(dropdown =>
        act.h(DropdownRenderer, { dropdownEngine, core, dropdown }));
    }
  }

  console.log(dropdowns);

  return dropdownEngine;
};

export type DropdownRendererProps = {
  dropdown: DropdownEntry,

  dropdownEngine: EyeballDropdown,
  core: EyeballCore,
}

export const DropdownRenderer: act.Component<DropdownRendererProps> = ({ dropdown, core, dropdownEngine }) => {
  const ref = act.useRef<HTMLElement | null>(null);
  const position = dropdown.placement && dropdown.placement.position || vec.zero;

  act.useEffect(() => {
    const dropdownElement = ref.current;
    if (!dropdownElement)
      return;

    const domRect = dropdownElement.getBoundingClientRect();
    const size = vec.new2(domRect.width, domRect.height);
    const candidates = calculateCandidatePositions(dropdown.target || rect.new2(vec.zero, vec.zero), size);

    const position = candidates.find(c => rect.within(core.screenRect, rect.new2(c, size))) || vec.zero;

    dropdownEngine.place(dropdown.id, rect.new2(position, size));
  }, [core.screenRect]);

  return act.h('div', {
    ref,
    style: {
      transform: `translate(${position.x}px, ${position.y}px)`,
      position: 'absolute',
      zIndex: 1
    }
  }, dropdown.content);
}

const corners: Vec<2>[] = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
];

export const calculateCandidatePositions = (base: Rect<2>, targetSize: Vec<2>): Vec<2>[] => {
  const candidates: Vec<2>[] = [];

  for (const corner of corners) {
    const cornerPosition = vec.a(base.position, vec.m(corner, base.size));

    const candidateA = vec.a(cornerPosition, vec.new2(
      (corner.x * targetSize.x)  * -1,
      (corner.y * targetSize.y) - targetSize.y,
    ))

    const candidateB = vec.a(cornerPosition, vec.new2(
      (corner.x * targetSize.x) - targetSize.x,
      (corner.y * targetSize.y) * -1
    ));

    candidates.push(candidateA, candidateB);
  }
  return candidates;
}