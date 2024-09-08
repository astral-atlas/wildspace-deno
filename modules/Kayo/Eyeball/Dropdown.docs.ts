import { Rect, rect2WithinRect, rectContains, rect as rectu } from "space/rects";
import { act } from "../deps";
import { calculateDropdownCandidatePositions } from "./Dropdown";
import { vec, Vector } from "space/vectors";
import { useInputStoryManager } from "../../ComponentDoc/mod";
import { Vector2Editor, Vector2Input } from "../../Formula/mod";
import { three } from "../../AtlasRenderer/deps";

const Vector2Controls = ({ label, value, next }: { label: string, value: Vector<2>, next: (value: Vector<2>) => void }) => {
  return act.h('div', {}, [
    act.h('div', {}, label),
    act.h('input', {
      type: 'range',
      min: -40,
      max: 160,
      value: value.x,
      onInput: (e: InputEvent) => next({ ...value, x: (e.currentTarget as HTMLInputElement).valueAsNumber })
    }),
    act.h('input', {
      type: 'range',
      min: -40,
      max: 160,
      value: value.y,
      onInput: (e: InputEvent) => next({ ...value, y: (e.currentTarget as HTMLInputElement).valueAsNumber })
    }),
  ])
}

export const DropdownCandidateDemo = () => {
  const inputs = useInputStoryManager();

  const basePosition = inputs.useStoryInput(
    (value, next) => act.h(Vector2Controls, { label: "Base Position", value, next }),
    vec.new2(40, 40)
  )
  const baseSize = inputs.useStoryInput(
    (value, next) => act.h(Vector2Controls, { label: "Base Size", value, next }),
    vec.new2(40, 40)
  )
  const targetSize = inputs.useStoryInput(
    (value, next) => act.h(Vector2Controls, { label: "Target Size", value, next }),
    vec.new2(10, 10)
  )

  const base = rectu.new2(basePosition, baseSize)

  const candidates = calculateDropdownCandidatePositions(base, targetSize)
    .sort((a, b) => b.y - a.y || a.x - b.x);

  const viewport = rectu.new2(vec.new2(0, 0), vec.new2(160, 160));

  const selectedCandidate = candidates.find(c => rect2WithinRect(viewport, rectu.new2(c, targetSize)))

  return [
    inputs.renderInputs(),
    act.h('div', { style: { display: 'flex'} },
      act.h('svg', { viewBox: '0 0 160 160', style: { flex: 1, border: '1px solid black' } }, [
        act.h(RectSVG, { rect: base, color: 'red' }, 'Base'),
        candidates.map((candidate, i) => act.h(RectSVG, {
          rect: rectu.new2(candidate, targetSize),
          color: candidate === selectedCandidate
            ? 'green'
            : rect2WithinRect(viewport, rectu.new2(candidate, targetSize))
              ? 'blue'
              : 'orange',
        }, i)),
      ])
    )
  ];
};

export const RectSVG = ({ rect, color, children }: { rect: Rect<2>, color: string, children: act.ElementNode }) => {
  const x = `${rect.position.x}px`;
  const y = `${rect.position.y}px`
  return [
    act.h('rect', {
      fill: color,
      width: `${rect.size.x}px`, height: `${rect.size.y}px`,
      x, y,
    }),
    act.h('text', { x, y: `${rect.position.y + rect.size.y}px`, style: { fontSize: '5px', fill: 'white' } }, children)
  ]
}