import { Rect, rect as rectu } from "space/rects";
import { act } from "../deps";
import { DropdownEntry, EyeballEngine } from "./engine";
import { vec, Vector } from "space/vectors";

export type DropdownContainerProps = {
  entry: DropdownEntry,
  eyeball: EyeballEngine,
};

export const DropdownContainer: act.Component<DropdownContainerProps> = ({ entry, eyeball }) => {
  const ref = act.useRef<HTMLElement | null>(null);
  const [rect, setRect] = act.useState<DOMRect | null>(null);

  act.useEffect(() => {
    const { current } = ref;
    if (!current)
      return;
    setRect(current.getBoundingClientRect());
  }, []);

  const candidates = act.useMemo(() => {
    if (!rect)
      return [];
    return calculateDropdownCandidatePositions(entry.placementRect, vec.new2(rect.width, rect.height))
      .sort((a, b) => b.y - a.y)
      .find(c => rectu.within(eyeball.screenspaceElementRef))
  }, [rect, entry.placementRect])

  return act.h('div', { ref }, entry.render(entry));
};

export const calculateDropdownCandidatePositions = (base: Rect<2>, targetSize: Vector<2>): Vector<2>[] => {
  // Each "corner" of the base can have a dropdown in two positions, extending
  // each axis

  const corners = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ]

  const candidates: Vector<2>[] = [];

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