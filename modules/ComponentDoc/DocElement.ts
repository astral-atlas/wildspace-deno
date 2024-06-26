import { act } from "./deps.ts";

export type DocElement =
  | { type: 'title', text: string }
  | { type: 'section-heading', headingName: string }
  | { type: 'paragraph', text: string }
  | { type: 'component', component: act.Component }
  | { type: 'rich', richElement: act.ElementNode }
  | { type: 'nested-sheet', sheet: DocSheet }

export type DocSheet = {
  parentId?: null | string,
  id: string,
  elements: DocElement[],
}

export const getSheetParents = (
  allSheets: DocSheet[],
  sheet: DocSheet
): null | DocSheet[] => {
  if (sheet.parentId) {
    const parent = allSheets.find(s => s.id === sheet.parentId);
    const grandparents = parent && getSheetParents(allSheets, parent);
    if (!grandparents)
      return null
    return [...grandparents, parent];
  }
  return [];
}

export const calculateSheetPath = (
  allSheets: DocSheet[],
  sheet: DocSheet
): string | null => {
  const parents = getSheetParents(allSheets, sheet);
  if (!parents)
    return null;
  return [...parents.map(p => p.id), sheet.id].join('/');
}