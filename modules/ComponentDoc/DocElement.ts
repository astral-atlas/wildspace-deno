import { Component, ElementNode } from "https://esm.sh/v126/@lukekaalim/act@2.6.0";

export type DocElement =
  | { type: 'title', text: string }
  | { type: 'section-heading', headingName: string }
  | { type: 'paragraph', text: string }
  | { type: 'component', component: Component }
  | { type: 'rich', richElement: ElementNode }
  | { type: 'nested-sheet', sheet: DocSheet }

export type DocSheet = {
  id: string,
  elements: DocElement[],
}
